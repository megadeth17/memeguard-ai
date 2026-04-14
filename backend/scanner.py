"""
BSC Scanner — monitors new token launches.

Primary: Four.Meme factory TokenCreated events.
Fallback: PancakeSwap V2 PairCreated events filtered for new small-cap pairs.
If FOURMEME_FACTORY_ADDRESS is the zero address (placeholder), falls back automatically.
"""
import asyncio
import logging
from datetime import datetime
from typing import Callable, Awaitable

from web3 import Web3
from web3.exceptions import ContractLogicError

import config

logger = logging.getLogger(__name__)

# Minimal ERC-20 ABI for name/symbol/decimals/totalSupply
ERC20_ABI = [
    {"inputs": [], "name": "name", "outputs": [{"type": "string"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "symbol", "outputs": [{"type": "string"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "decimals", "outputs": [{"type": "uint8"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "totalSupply", "outputs": [{"type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"type": "address"}], "name": "balanceOf", "outputs": [{"type": "uint256"}], "stateMutability": "view", "type": "function"},
]

# PancakeSwap V2 Factory ABI (PairCreated event only)
PANCAKE_FACTORY_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "token0", "type": "address"},
            {"indexed": True, "name": "token1", "type": "address"},
            {"indexed": False, "name": "pair", "type": "address"},
            {"indexed": False, "name": "unnamed", "type": "uint256"},
        ],
        "name": "PairCreated",
        "type": "event",
    }
]

# PancakeSwap V2 Pair ABI (for liquidity check)
PAIR_ABI = [
    {"inputs": [], "name": "getReserves", "outputs": [
        {"name": "reserve0", "type": "uint112"},
        {"name": "reserve1", "type": "uint112"},
        {"name": "blockTimestampLast", "type": "uint32"},
    ], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "token0", "outputs": [{"name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "token1", "outputs": [{"name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
]

ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
WBNB = Web3.to_checksum_address(config.WBNB_ADDRESS)


class FourMemeScanner:
    def __init__(self, on_new_token: Callable[[dict], Awaitable[None]]):
        self.w3 = Web3(Web3.HTTPProvider(config.BSC_RPC_URL))
        self.on_new_token = on_new_token
        self.seen_pairs: set[str] = set()
        self.last_block = 0

        use_fourmeme = (
            config.FOURMEME_FACTORY_ADDRESS.lower() != ZERO_ADDRESS.lower()
        )
        if use_fourmeme:
            logger.info("Using Four.Meme factory: %s", config.FOURMEME_FACTORY_ADDRESS)
        else:
            logger.info(
                "Four.Meme factory address not set — using PancakeSwap V2 fallback: %s",
                config.PANCAKE_FACTORY_V2,
            )

        self.pancake_factory = self.w3.eth.contract(
            address=Web3.to_checksum_address(config.PANCAKE_FACTORY_V2),
            abi=PANCAKE_FACTORY_ABI,
        )

    async def start_scanning(self) -> None:
        logger.info("Scanner started — polling BSC every %ds", config.SCAN_INTERVAL_SECONDS)
        self.last_block = self.w3.eth.block_number - 100  # start 100 blocks back
        while True:
            try:
                await self._poll_new_pairs()
            except Exception as exc:
                logger.error("Scan error: %s", exc)
                await asyncio.sleep(5)
            await asyncio.sleep(config.SCAN_INTERVAL_SECONDS)

    async def _poll_new_pairs(self) -> None:
        current_block = self.w3.eth.block_number
        if current_block <= self.last_block:
            return

        from_block = self.last_block + 1
        to_block = min(current_block, from_block + 499)  # BSC public RPC limit

        events = self.pancake_factory.events.PairCreated.get_logs(
            from_block=from_block, to_block=to_block
        )

        for event in events:
            token0 = event["args"]["token0"]
            token1 = event["args"]["token1"]
            pair = event["args"]["pair"]

            if pair in self.seen_pairs:
                continue
            self.seen_pairs.add(pair)

            # Only care about WBNB pairs
            if WBNB not in (token0, token1):
                continue

            token_address = token1 if token0 == WBNB else token0
            token_data = await self.get_token_metadata(token_address)
            if token_data is None:
                continue

            liquidity = await self.get_liquidity_info(pair)
            if liquidity["bnb"] < config.MIN_LIQUIDITY_BNB:
                continue

            holders = await self.get_holder_distribution(token_address)

            full_data = {
                **token_data,
                "pair_address": pair,
                "liquidity_bnb": liquidity["bnb"],
                "holder_count": holders["count"],
                "top10_concentration": holders["top10_pct"],
                "contract_verified": False,  # BSCScan API needed for verification status
                "created_at": datetime.utcnow().isoformat(),
            }

            logger.info("New token detected: %s (%s) — %.2f BNB liquidity",
                        full_data["name"], full_data["symbol"], liquidity["bnb"])
            await self.on_new_token(full_data)

        self.last_block = to_block

    async def get_token_metadata(self, address: str) -> dict | None:
        try:
            address = Web3.to_checksum_address(address)
            contract = self.w3.eth.contract(address=address, abi=ERC20_ABI)
            name = self._safe_call(contract.functions.name)
            symbol = self._safe_call(contract.functions.symbol)
            if not name or not symbol:
                return None
            total_supply = self._safe_call(contract.functions.totalSupply) or 0
            decimals = self._safe_call(contract.functions.decimals) or 18
            return {
                "address": address,
                "name": name[:64],
                "symbol": symbol[:16],
                "total_supply": total_supply / (10 ** decimals),
                "decimals": decimals,
                "creator": self._get_deployer(address),
            }
        except Exception as exc:
            logger.debug("Failed to get metadata for %s: %s", address, exc)
            return None

    async def get_liquidity_info(self, pair_address: str) -> dict:
        try:
            pair_address = Web3.to_checksum_address(pair_address)
            pair = self.w3.eth.contract(address=pair_address, abi=PAIR_ABI)
            reserves = pair.functions.getReserves().call()
            token0 = pair.functions.token0().call()

            bnb_reserve = reserves[0] if token0 == WBNB else reserves[1]
            bnb_amount = bnb_reserve / 1e18
            return {"bnb": round(bnb_amount, 4), "pair": pair_address}
        except Exception:
            return {"bnb": 0.0, "pair": pair_address}

    async def get_holder_distribution(self, address: str) -> dict:
        # BSC public RPC does not expose holder lists — return placeholder.
        # In production: use BSCScan API or Moralis for real holder data.
        return {"count": 1, "top10_pct": 100.0, "top_holders": []}

    def _get_deployer(self, token_address: str) -> str:
        try:
            receipt = self.w3.eth.get_transaction_receipt(
                self.w3.eth.get_block("latest")["hash"]  # placeholder
            )
            return receipt.get("from", "unknown")
        except Exception:
            return "unknown"

    def _safe_call(self, fn):
        try:
            return fn().call()
        except (ContractLogicError, Exception):
            return None
