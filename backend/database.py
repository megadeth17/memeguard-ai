import aiosqlite
import json
from datetime import datetime
from config import DATABASE_PATH

CREATE_TOKENS = """
CREATE TABLE IF NOT EXISTS tokens (
    address TEXT PRIMARY KEY,
    name TEXT,
    symbol TEXT,
    creator TEXT,
    liquidity_bnb REAL,
    holder_count INTEGER,
    top10_concentration REAL,
    contract_verified BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
"""

CREATE_SCORES = """
CREATE TABLE IF NOT EXISTS scores (
    token_address TEXT PRIMARY KEY,
    safety_score INTEGER,
    alpha_score INTEGER,
    narrative_score INTEGER,
    overall_score INTEGER,
    analysis_text TEXT,
    flags TEXT,
    recommendation TEXT,
    scored_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (token_address) REFERENCES tokens(address)
)
"""

CREATE_ALERTS = """
CREATE TABLE IF NOT EXISTS alerts_sent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_address TEXT,
    alert_type TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
"""


async def init_db() -> None:
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(CREATE_TOKENS)
        await db.execute(CREATE_SCORES)
        await db.execute(CREATE_ALERTS)
        await db.commit()


async def upsert_token(token: dict) -> None:
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            """
            INSERT INTO tokens (address, name, symbol, creator, liquidity_bnb,
                holder_count, top10_concentration, contract_verified, created_at, updated_at)
            VALUES (:address, :name, :symbol, :creator, :liquidity_bnb,
                :holder_count, :top10_concentration, :contract_verified, :created_at, :updated_at)
            ON CONFLICT(address) DO UPDATE SET
                liquidity_bnb = excluded.liquidity_bnb,
                holder_count = excluded.holder_count,
                top10_concentration = excluded.top10_concentration,
                updated_at = excluded.updated_at
            """,
            {
                **token,
                "created_at": token.get("created_at", datetime.utcnow().isoformat()),
                "updated_at": datetime.utcnow().isoformat(),
            },
        )
        await db.commit()


async def upsert_score(score: dict) -> None:
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            """
            INSERT INTO scores (token_address, safety_score, alpha_score, narrative_score,
                overall_score, analysis_text, flags, recommendation, scored_at)
            VALUES (:token_address, :safety_score, :alpha_score, :narrative_score,
                :overall_score, :analysis_text, :flags, :recommendation, :scored_at)
            ON CONFLICT(token_address) DO UPDATE SET
                safety_score = excluded.safety_score,
                alpha_score = excluded.alpha_score,
                narrative_score = excluded.narrative_score,
                overall_score = excluded.overall_score,
                analysis_text = excluded.analysis_text,
                flags = excluded.flags,
                recommendation = excluded.recommendation,
                scored_at = excluded.scored_at
            """,
            {
                **score,
                "flags": json.dumps(score.get("flags", [])),
                "scored_at": datetime.utcnow().isoformat(),
            },
        )
        await db.commit()


async def get_tokens(limit: int = 50, offset: int = 0, sort_by: str = "overall_score") -> list:
    allowed_sort = {"overall_score", "safety_score", "alpha_score", "created_at"}
    if sort_by not in allowed_sort:
        sort_by = "overall_score"

    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            f"""
            SELECT t.*, s.safety_score, s.alpha_score, s.narrative_score,
                   s.overall_score, s.analysis_text, s.flags, s.recommendation, s.scored_at
            FROM tokens t
            LEFT JOIN scores s ON t.address = s.token_address
            ORDER BY COALESCE(s.{sort_by}, 0) DESC
            LIMIT ? OFFSET ?
            """,
            (limit, offset),
        )
        rows = await cursor.fetchall()
        return [_row_to_dict(r) for r in rows]


async def get_token(address: str) -> dict | None:
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """
            SELECT t.*, s.safety_score, s.alpha_score, s.narrative_score,
                   s.overall_score, s.analysis_text, s.flags, s.recommendation, s.scored_at
            FROM tokens t
            LEFT JOIN scores s ON t.address = s.token_address
            WHERE t.address = ?
            """,
            (address,),
        )
        row = await cursor.fetchone()
        return _row_to_dict(row) if row else None


async def get_top_tokens(hours: int = 24, limit: int = 10) -> list:
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """
            SELECT t.*, s.safety_score, s.alpha_score, s.narrative_score,
                   s.overall_score, s.analysis_text, s.flags, s.recommendation, s.scored_at
            FROM tokens t
            LEFT JOIN scores s ON t.address = s.token_address
            WHERE t.created_at >= datetime('now', ?)
            ORDER BY COALESCE(s.overall_score, 0) DESC
            LIMIT ?
            """,
            (f"-{hours} hours", limit),
        )
        rows = await cursor.fetchall()
        return [_row_to_dict(r) for r in rows]


async def get_stats() -> dict:
    async with aiosqlite.connect(DATABASE_PATH) as db:
        cursor = await db.execute(
            "SELECT COUNT(*) FROM tokens WHERE created_at >= datetime('now', '-24 hours')"
        )
        scanned_today = (await cursor.fetchone())[0]

        cursor = await db.execute("SELECT AVG(overall_score) FROM scores")
        avg_score = (await cursor.fetchone())[0] or 0

        cursor = await db.execute(
            "SELECT COUNT(*) FROM alerts_sent WHERE sent_at >= datetime('now', '-24 hours')"
        )
        alerts_today = (await cursor.fetchone())[0]

        cursor = await db.execute("SELECT COUNT(*) FROM tokens")
        total_tokens = (await cursor.fetchone())[0]

    return {
        "scanned_today": scanned_today,
        "total_tokens": total_tokens,
        "avg_score": round(avg_score, 1),
        "alerts_today": alerts_today,
    }


async def record_alert(token_address: str, alert_type: str) -> None:
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            "INSERT INTO alerts_sent (token_address, alert_type) VALUES (?, ?)",
            (token_address, alert_type),
        )
        await db.commit()


async def count_alerts_last_hour() -> int:
    async with aiosqlite.connect(DATABASE_PATH) as db:
        cursor = await db.execute(
            "SELECT COUNT(*) FROM alerts_sent WHERE sent_at >= datetime('now', '-1 hour')"
        )
        return (await cursor.fetchone())[0]


async def alert_already_sent(token_address: str) -> bool:
    async with aiosqlite.connect(DATABASE_PATH) as db:
        cursor = await db.execute(
            "SELECT COUNT(*) FROM alerts_sent WHERE token_address = ?",
            (token_address,),
        )
        return (await cursor.fetchone())[0] > 0


def _row_to_dict(row) -> dict:
    d = dict(row)
    if d.get("flags") and isinstance(d["flags"], str):
        try:
            d["flags"] = json.loads(d["flags"])
        except (json.JSONDecodeError, TypeError):
            d["flags"] = []
    return d
