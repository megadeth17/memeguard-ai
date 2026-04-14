"""
Seed demo data — populates the DB with realistic mock tokens for demo purposes.
Run: python seed_demo.py
All data is synthetic. BSC addresses are real-format but do not represent real tokens.
"""
import asyncio
import json
from datetime import datetime, timedelta
import random

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import database as db

# fmt: off
MOCK_TOKENS = [
    {
        "address": "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
        "name": "PepeGPT", "symbol": "PGPT",
        "creator": "0xaaaa1111bbbb2222cccc3333dddd4444eeee5555",
        "liquidity_bnb": 12.5, "holder_count": 347, "top10_concentration": 28.4,
        "contract_verified": True,
        "score": {"safety_score": 82, "alpha_score": 88, "narrative_score": 91,
                  "overall_score": 86, "recommendation": "ENTER",
                  "analysis_text": "Strong AI-meme narrative with healthy holder distribution. Creator has no rug history. Contract verified with no suspicious functions.",
                  "flags": ["strong_narrative", "clean_creator"]},
        "hours_ago": 2,
    },
    {
        "address": "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
        "name": "BNB Frog", "symbol": "BFROG",
        "creator": "0xbbbb2222cccc3333dddd4444eeee5555ffff6666",
        "liquidity_bnb": 3.8, "holder_count": 89, "top10_concentration": 61.2,
        "contract_verified": False,
        "score": {"safety_score": 31, "alpha_score": 45, "narrative_score": 62,
                  "overall_score": 42, "recommendation": "WATCH",
                  "analysis_text": "High holder concentration is a major red flag. Unverified contract adds risk. Narrative is on-trend but fundamentals are weak.",
                  "flags": ["high_concentration", "unverified_contract"]},
        "hours_ago": 4,
    },
    {
        "address": "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
        "name": "MoonDoge AI", "symbol": "MDAI",
        "creator": "0xcccc3333dddd4444eeee5555ffff66660000aaaa",
        "liquidity_bnb": 22.1, "holder_count": 891, "top10_concentration": 19.7,
        "contract_verified": True,
        "score": {"safety_score": 89, "alpha_score": 79, "narrative_score": 88,
                  "overall_score": 86, "recommendation": "ENTER",
                  "analysis_text": "Excellent distribution with almost 900 holders in first few hours. AI + dog meme combo hits two trending narratives simultaneously. Liquidity is solid.",
                  "flags": ["strong_narrative", "clean_creator", "healthy_distribution"]},
        "hours_ago": 1,
    },
    {
        "address": "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
        "name": "RugPull Classic", "symbol": "RPC",
        "creator": "0xdddd4444eeee5555ffff66660000aaaa1111bbbb",
        "liquidity_bnb": 0.8, "holder_count": 12, "top10_concentration": 94.3,
        "contract_verified": False,
        "score": {"safety_score": 8, "alpha_score": 12, "narrative_score": 20,
                  "overall_score": 12, "recommendation": "AVOID",
                  "analysis_text": "Extreme concentration — top 10 wallets hold 94% of supply. No contract verification. Creator has pattern consistent with serial ruggers. Avoid entirely.",
                  "flags": ["high_concentration", "unverified_contract", "creator_rug_history", "low_liquidity"]},
        "hours_ago": 6,
    },
    {
        "address": "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
        "name": "Trump Inu", "symbol": "TRUMPINU",
        "creator": "0xeeee5555ffff66660000aaaa1111bbbb2222cccc",
        "liquidity_bnb": 8.4, "holder_count": 234, "top10_concentration": 38.9,
        "contract_verified": True,
        "score": {"safety_score": 68, "alpha_score": 74, "narrative_score": 85,
                  "overall_score": 74, "recommendation": "WATCH",
                  "analysis_text": "Celebrity + animal meme is a powerful narrative combo. Concentration is moderate — worth watching. Strong initial buy pressure observed.",
                  "flags": ["strong_narrative", "moderate_concentration"]},
        "hours_ago": 3,
    },
    {
        "address": "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f50",
        "name": "DePin Cat", "symbol": "DPCAT",
        "creator": "0xffff66660000aaaa1111bbbb2222cccc3333dddd",
        "liquidity_bnb": 5.2, "holder_count": 156, "top10_concentration": 44.1,
        "contract_verified": False,
        "score": {"safety_score": 54, "alpha_score": 67, "narrative_score": 78,
                  "overall_score": 64, "recommendation": "WATCH",
                  "analysis_text": "DePIN + cat meme is an unusual but interesting narrative play. Contract unverified is concerning. Wait for more holder distribution before entering.",
                  "flags": ["unverified_contract", "strong_narrative"]},
        "hours_ago": 5,
    },
    {
        "address": "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5061",
        "name": "Galaxy Hamster", "symbol": "GHAM",
        "creator": "0x0000aaaa1111bbbb2222cccc3333dddd4444eeee",
        "liquidity_bnb": 31.7, "holder_count": 1204, "top10_concentration": 15.3,
        "contract_verified": True,
        "score": {"safety_score": 93, "alpha_score": 82, "narrative_score": 76,
                  "overall_score": 85, "recommendation": "ENTER",
                  "analysis_text": "Exceptional holder distribution at launch — 1200+ holders with only 15% top-10 concentration. High liquidity reduces rug risk significantly. Space + animal narrative trending.",
                  "flags": ["strong_narrative", "clean_creator", "healthy_distribution", "high_liquidity"]},
        "hours_ago": 0,
    },
    {
        "address": "0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f506172",
        "name": "Fed Printer", "symbol": "BRRR",
        "creator": "0x1111bbbb2222cccc3333dddd4444eeee5555ffff",
        "liquidity_bnb": 6.9, "holder_count": 312, "top10_concentration": 33.7,
        "contract_verified": True,
        "score": {"safety_score": 71, "alpha_score": 65, "narrative_score": 72,
                  "overall_score": 70, "recommendation": "WATCH",
                  "analysis_text": "Finance meme referencing monetary policy — resonates with macro-aware crypto community. Solid distribution and decent liquidity. Narrative may fade quickly.",
                  "flags": ["strong_narrative", "clean_creator"]},
        "hours_ago": 8,
    },
    {
        "address": "0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f50617283",
        "name": "Mars Rocket", "symbol": "MRKT",
        "creator": "0x2222cccc3333dddd4444eeee5555ffff66660000",
        "liquidity_bnb": 2.1, "holder_count": 67, "top10_concentration": 72.8,
        "contract_verified": False,
        "score": {"safety_score": 22, "alpha_score": 38, "narrative_score": 55,
                  "overall_score": 33, "recommendation": "AVOID",
                  "analysis_text": "Space narrative is solid but fundamentals are terrible. 73% concentration in top 10 wallets with tiny liquidity. Classic setup for a quick dump.",
                  "flags": ["high_concentration", "unverified_contract", "low_liquidity"]},
        "hours_ago": 12,
    },
    {
        "address": "0x0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5061728394",
        "name": "RWA Monkey", "symbol": "RWAMO",
        "creator": "0x3333dddd4444eeee5555ffff66660000aaaa1111",
        "liquidity_bnb": 18.3, "holder_count": 523, "top10_concentration": 24.6,
        "contract_verified": True,
        "score": {"safety_score": 84, "alpha_score": 77, "narrative_score": 82,
                  "overall_score": 81, "recommendation": "ENTER",
                  "analysis_text": "RWA + monkey meme cleverly combines two trending themes. Strong holder count for age. Verified contract with no honeypot indicators. Watch for sustained buy pressure.",
                  "flags": ["strong_narrative", "clean_creator", "healthy_distribution"]},
        "hours_ago": 7,
    },
    {
        "address": "0x1e2f3a4b5c6d7e8f9a0b1c2d3e4f506172839405",
        "name": "Elon Dog", "symbol": "EDOGE",
        "creator": "0x4444eeee5555ffff66660000aaaa1111bbbb2222",
        "liquidity_bnb": 9.7, "holder_count": 445, "top10_concentration": 31.2,
        "contract_verified": True,
        "score": {"safety_score": 73, "alpha_score": 80, "narrative_score": 90,
                  "overall_score": 80, "recommendation": "ENTER",
                  "analysis_text": "Celebrity + dog narrative is historically one of the strongest memecoin plays. Healthy distribution with 440+ holders. Liquidity adequate for entry.",
                  "flags": ["strong_narrative", "clean_creator"]},
        "hours_ago": 9,
    },
    {
        "address": "0x2f3a4b5c6d7e8f9a0b1c2d3e4f50617283940516",
        "name": "Micro Cap Gem", "symbol": "MCG",
        "creator": "0x5555ffff66660000aaaa1111bbbb2222cccc3333",
        "liquidity_bnb": 1.4, "holder_count": 28, "top10_concentration": 81.5,
        "contract_verified": False,
        "score": {"safety_score": 15, "alpha_score": 28, "narrative_score": 35,
                  "overall_score": 22, "recommendation": "AVOID",
                  "analysis_text": "High concentration, unverified contract, minimal liquidity. Name suggests gem but all indicators point to potential exit scam. Avoid.",
                  "flags": ["high_concentration", "unverified_contract", "low_liquidity", "suspicious_name"]},
        "hours_ago": 18,
    },
    {
        "address": "0x3a4b5c6d7e8f9a0b1c2d3e4f5061728394051627",
        "name": "Neural BNB", "symbol": "NBNB",
        "creator": "0x6666aaaa7777bbbb8888cccc9999dddd0000eeee",
        "liquidity_bnb": 14.8, "holder_count": 678, "top10_concentration": 22.1,
        "contract_verified": True,
        "score": {"safety_score": 87, "alpha_score": 85, "narrative_score": 88,
                  "overall_score": 87, "recommendation": "ENTER",
                  "analysis_text": "AI narrative with BNB ecosystem branding — strong local appeal on Four.Meme. Near-perfect holder distribution and verified contract. Top pick for the week.",
                  "flags": ["strong_narrative", "clean_creator", "healthy_distribution", "high_liquidity"]},
        "hours_ago": 11,
    },
    {
        "address": "0x4b5c6d7e8f9a0b1c2d3e4f506172839405162738",
        "name": "Pepe Classic", "symbol": "PEPEC",
        "creator": "0x7777bbbb8888cccc9999dddd0000eeee1111ffff",
        "liquidity_bnb": 7.3, "holder_count": 189, "top10_concentration": 49.8,
        "contract_verified": False,
        "score": {"safety_score": 41, "alpha_score": 58, "narrative_score": 70,
                  "overall_score": 54, "recommendation": "WATCH",
                  "analysis_text": "Classic Pepe narrative always has demand. But 50% concentration and unverified contract are concerning. Small position only if entering.",
                  "flags": ["high_concentration", "unverified_contract", "strong_narrative"]},
        "hours_ago": 14,
    },
    {
        "address": "0x5c6d7e8f9a0b1c2d3e4f50617283940516273849",
        "name": "BNB Gaming Guild", "symbol": "BGG",
        "creator": "0x8888cccc9999dddd0000eeee1111ffff2222aaaa",
        "liquidity_bnb": 25.6, "holder_count": 934, "top10_concentration": 18.9,
        "contract_verified": True,
        "score": {"safety_score": 91, "alpha_score": 76, "narrative_score": 74,
                  "overall_score": 81, "recommendation": "ENTER",
                  "analysis_text": "Gaming + BNB ecosystem combo. Exceptional launch metrics — 934 holders with <20% concentration. Verified and liquid. Long-term narrative play.",
                  "flags": ["strong_narrative", "clean_creator", "healthy_distribution", "high_liquidity"]},
        "hours_ago": 20,
    },
]
# fmt: on


async def seed():
    await db.init_db()
    now = datetime.utcnow()
    seeded = 0

    for mock in MOCK_TOKENS:
        created_at = (now - timedelta(hours=mock["hours_ago"])).isoformat()
        token = {
            "address": mock["address"],
            "name": mock["name"],
            "symbol": mock["symbol"],
            "creator": mock["creator"],
            "liquidity_bnb": mock["liquidity_bnb"],
            "holder_count": mock["holder_count"],
            "top10_concentration": mock["top10_concentration"],
            "contract_verified": mock["contract_verified"],
            "created_at": created_at,
        }
        await db.upsert_token(token)

        score = {
            "token_address": mock["address"],
            **mock["score"],
        }
        await db.upsert_score(score)
        seeded += 1

    print(f"Seeded {seeded} tokens into {db.DATABASE_PATH}")


if __name__ == "__main__":
    asyncio.run(seed())
