"""
MemeGuard AI — FastAPI orchestrator.

Runs the BSC scanner in background and serves the REST + WebSocket API.
"""
import asyncio
import json
import logging
import os
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import database as db
from telegram_bot import TelegramAlerter

# Optional imports — web3 requires C extensions not available in all envs
try:
    from analyzer import TokenAnalyzer
    from scanner import FourMemeScanner
    SCANNER_AVAILABLE = True
except ImportError as _e:
    SCANNER_AVAILABLE = False

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("main")

# Shared state
alerter = TelegramAlerter()
ws_clients: list[WebSocket] = []

if SCANNER_AVAILABLE:
    analyzer = TokenAnalyzer()  # type: ignore[assignment]


async def handle_new_token(token_data: dict) -> None:
    """Pipeline: store → analyze → alert → broadcast."""
    await db.upsert_token(token_data)

    if SCANNER_AVAILABLE:
        score = await analyzer.analyze_token(token_data)  # type: ignore[name-defined]
        await db.upsert_score(score)
        await alerter.maybe_send_alert(token_data, score)
        payload = json.dumps({"type": "new_token", "token": token_data, "score": score})
    else:
        payload = json.dumps({"type": "new_token", "token": token_data})

    dead = []
    for ws in ws_clients:
        try:
            await ws.send_text(payload)
        except Exception:
            dead.append(ws)
    for ws in dead:
        ws_clients.remove(ws)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.init_db()

    if SCANNER_AVAILABLE:
        scanner = FourMemeScanner(on_new_token=handle_new_token)  # type: ignore[name-defined]
        scan_task = asyncio.create_task(scanner.start_scanning())
        logger.info("MemeGuard AI started — scanner ACTIVE")
    else:
        scan_task = None
        logger.warning("MemeGuard AI started — scanner DISABLED (web3 not installed). Running in demo mode with seeded data.")

    yield

    if scan_task:
        scan_task.cancel()
        try:
            await scan_task
        except asyncio.CancelledError:
            pass
    logger.info("MemeGuard AI stopped")


app = FastAPI(title="MemeGuard AI", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── REST API ────────────────────────────────────────────────────────────────

@app.get("/api/tokens")
async def list_tokens(
    limit: int = 50,
    offset: int = 0,
    sort_by: str = "overall_score",
) -> dict:
    tokens = await db.get_tokens(limit=limit, offset=offset, sort_by=sort_by)
    return {"tokens": tokens, "limit": limit, "offset": offset}


@app.get("/api/tokens/top")
async def top_tokens(hours: int = 24, limit: int = 10) -> dict:
    tokens = await db.get_top_tokens(hours=hours, limit=limit)
    return {"tokens": tokens}


@app.get("/api/tokens/{address}")
async def get_token(address: str) -> dict:
    token = await db.get_token(address)
    if token is None:
        raise HTTPException(status_code=404, detail="Token not found")
    return token


@app.get("/api/stats")
async def stats() -> dict:
    return await db.get_stats()


# ── WebSocket ────────────────────────────────────────────────────────────────

@app.websocket("/ws/feed")
async def websocket_feed(websocket: WebSocket):
    await websocket.accept()
    ws_clients.append(websocket)
    try:
        while True:
            # Keep connection alive — client sends pings
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in ws_clients:
            ws_clients.remove(websocket)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "clients": len(ws_clients)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
