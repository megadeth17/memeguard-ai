# MemeGuard AI

**Your AI-Powered Shield in the Memecoin Jungle**

> Autonomous AI agent that monitors memecoin launches on Four.Meme (BNB Chain), scores them for risk and opportunity using Claude AI, and delivers actionable intelligence via a real-time dashboard and Telegram alerts.

Built for the [Four.Meme AI Sprint — DoraHacks](https://dorahacks.io) hackathon.

---

## The Problem

Four.Meme launches hundreds of memecoins daily on BNB Chain. Over 90% fail or rug within hours. Traders have no fast, structured way to evaluate new launches before buying.

## The Solution

MemeGuard AI runs an autonomous pipeline:

1. **Scanner** — Monitors BSC for new token pairs every 10 seconds
2. **Analyzer** — Claude AI scores each token: Safety, Alpha potential, Narrative alignment
3. **Dashboard** — Real-time cyberpunk dashboard with filterable token cards
4. **Telegram Bot** — Instant alerts for high-scoring opportunities and rug warnings

---

## Architecture

```
BSC RPC (polling 10s)
    └── scanner.py         # Detects PancakeSwap/Four.Meme new pairs
         └── database.py   # SQLite persistence
              └── analyzer.py  # Claude Haiku → structured JSON scores
                   ├── telegram_bot.py   # Alerts (score ≥ 70 → ENTER, < 30 → AVOID)
                   └── main.py (FastAPI) # REST API + WebSocket feed
                        └── frontend/   # React dashboard (cyberpunk theme)
```

## Score System

| Component | Weight | Description |
|-----------|--------|-------------|
| Safety Score | 40% | Rug pull risk — concentration, verification, creator history |
| Alpha Score | 35% | Upside potential — mcap, holder growth, momentum |
| Narrative Score | 25% | Meme/cultural alignment with trending topics |
| **Overall Score** | — | Weighted composite (0–100) |

**Recommendations:** `ENTER` (≥70) · `WATCH` (40–69) · `AVOID` (<40)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| AI Analysis | Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) |
| Backend | Python 3.11 · FastAPI · web3.py · aiosqlite |
| Blockchain | BNB Chain (BSC) via public RPC |
| Frontend | React 18 · Recharts · JetBrains Mono · Orbitron |
| Alerts | python-telegram-bot v20 |
| Storage | SQLite (portable, no setup) |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Anthropic API key
- (Optional) Telegram bot token + chat ID

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp ../.env.example ../.env
# Edit .env — add ANTHROPIC_API_KEY at minimum

# Seed demo data (recommended for first run)
python seed_demo.py

# Start API server
python main.py
# → http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm start
# → http://localhost:3000
```

### API Endpoints

```
GET  /api/tokens              List all tokens (paginated, sortable)
GET  /api/tokens/top          Top tokens in last 24h
GET  /api/tokens/{address}    Single token detail + AI analysis
GET  /api/stats               Dashboard statistics
WS   /ws/feed                 Real-time new token feed
```

---

## Demo Data

Run `python backend/seed_demo.py` to populate 15 realistic mock tokens spanning all score ranges. The dashboard is immediately usable for demo purposes without a live BSC connection.

---

## Roadmap

- **Mobile app** — React Native with push notifications
- **On-chain scoring** — Publish scores to BSC as attestations
- **DAO governance** — Community-tunable scoring weights
- **Multi-chain** — Ethereum, Base, Solana support
- **Historical analytics** — Track score accuracy vs actual price performance
- **Social integration** — Twitter/X and Farcaster trend signals

---

## Disclaimer

MemeGuard AI provides analysis and information only. Nothing here constitutes financial advice. Always do your own research (DYOR). Memecoins are extremely high-risk assets.

---

## License

MIT
