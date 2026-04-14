# MemeGuard AI — Claude Code Instructions

## Core Principles

### Think Before Coding
- Read existing files before writing or editing anything.
- Understand the data flow: Scanner → Analyzer → Database → API → Frontend.
- When unsure about a contract ABI or RPC behavior, check BSCScan or test with a small script first.

### Simplicity First
- SQLite over any hosted DB. FastAPI over complex middleware. Polling over websockets when polling is sufficient.
- No smart contracts. No trade execution. Read-only on BSC.
- If the Four.Meme factory address cannot be confirmed, fall back to PancakeSwap V2 `PairCreated` events filtered for small-cap launches. Document the fallback clearly.
- Mock data is acceptable for demo purposes — label it as such in code comments.

### Surgical Changes
- Edit files. Do not rewrite them from scratch unless the structure is fundamentally broken.
- Keep functions under 50 lines. Files under 800 lines.
- One responsibility per module: scanner scans, analyzer analyzes, bot alerts, API serves.

### Goal-Driven Execution
- The deliverable is a working demo for DoraHacks by April 30, 2026.
- Priority order: backend pipeline first, seeded demo data second, frontend third, polish last.
- A functional demo with mock data beats a broken demo with real data.

---

## Architecture

```
BSC RPC (polling)
    └── scanner.py          # Detects new token launches
         └── database.py    # SQLite persistence
              └── analyzer.py  # Claude API → structured scores
                   ├── telegram_bot.py  # Alerts on score >= 70
                   └── main.py (FastAPI)
                        └── frontend (React)  # Dashboard + live feed
```

## Key Constraints

- **No .env or API keys in commits** — use `.env.example` with placeholders only.
- **BSC RPC:** Use `https://bsc-dataseed1.binance.org` (public, no key). Handle rate limits with exponential backoff.
- **Claude API model:** `claude-haiku-4-5-20251001` for high-volume token analysis (cost-efficient). `claude-sonnet-4-6` only for complex edge cases.
- **Alert rate limit:** Max 1 alert per token, max 10 per hour to Telegram.
- **Score threshold for alert:** overall_score >= 70 → WATCH/ENTER alert. overall_score < 30 with rising volume → rug warning.

## Score Schema (canonical — do not change structure)

```json
{
  "safety_score": 0,
  "alpha_score": 0,
  "narrative_score": 0,
  "overall_score": 0,
  "analysis_text": "",
  "flags": [],
  "recommendation": "WATCH | ENTER | AVOID"
}
```

Weights: safety 40%, alpha 35%, narrative 25%.

## API Endpoints (canonical)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tokens` | All tokens, paginated, sortable by score |
| GET | `/api/tokens/{address}` | Single token detail + AI analysis |
| GET | `/api/tokens/top` | Top scored tokens in last 24h |
| GET | `/api/stats` | Dashboard stats |
| WS | `/ws/feed` | Real-time new token feed |

## Frontend Aesthetic

Dark cyberpunk terminal. Background `#0a0a0f`, neon green `#00ff88`, electric blue `#00d4ff`.
Fonts: JetBrains Mono (data), Orbitron or Space Grotesk (headers).
Score cards: green border > 70, yellow 40–70, red < 40.

## Approach

1. Check if the file you're about to write already exists — edit, don't recreate.
2. Verify BSC contract addresses on BSCScan before hardcoding them.
3. Test the scanner with a 10-block backfill before running live.
4. Populate `seed_demo.py` early so the dashboard is demo-ready at any point.
5. Never commit secrets. Always use `os.getenv()` with a clear error if missing.
