import os
from dotenv import load_dotenv

load_dotenv()

# RPC & Chain
BSC_RPC_URL = os.getenv("BSC_RPC_URL", "https://bsc-dataseed1.binance.org")

# Four.Meme factory (may be placeholder — scanner falls back to PancakeSwap)
FOURMEME_FACTORY_ADDRESS = os.getenv(
    "FOURMEME_FACTORY_ADDRESS",
    "0x0000000000000000000000000000000000000000"
)
PANCAKE_FACTORY_V2 = os.getenv(
    "PANCAKE_FACTORY_V2",
    "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"
)

# AI — validated lazily by analyzer.py when first used
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANALYSIS_MODEL = "claude-haiku-4-5-20251001"  # cost-efficient for bulk analysis

# Telegram
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

# Storage
DATABASE_PATH = os.getenv("DATABASE_PATH", "memeguard.db")

# Scanning
SCAN_INTERVAL_SECONDS = int(os.getenv("SCAN_INTERVAL_SECONDS", "10"))
MIN_LIQUIDITY_BNB = float(os.getenv("MIN_LIQUIDITY_BNB", "0.5"))

# Alerts
ALERT_SCORE_THRESHOLD = int(os.getenv("ALERT_SCORE_THRESHOLD", "70"))
MAX_ALERTS_PER_HOUR = int(os.getenv("MAX_ALERTS_PER_HOUR", "10"))

# WBNB address on BSC (for liquidity pair detection)
WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"

# PancakeSwap V2 Router (for price checks)
PANCAKE_ROUTER_V2 = "0x10ED43C718714eb63d5aA57B78B54704E256024E"
