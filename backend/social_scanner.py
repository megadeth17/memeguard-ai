"""
Social Scanner — detects trending crypto narratives.
Uses a curated keyword list (no external API required for demo).
In production: integrate Twitter/X API or Nansen Narrative API.
"""
import logging

logger = logging.getLogger(__name__)

# Curated trending narrative keywords (updated manually or via future API integration)
NARRATIVE_KEYWORDS: list[tuple[str, list[str]]] = [
    ("AI agents", ["ai", "agent", "gpt", "llm", "neural", "artificial"]),
    ("RWA / real world assets", ["rwa", "realworld", "tokenized", "treasury"]),
    ("DePIN", ["depin", "physical", "infrastructure", "sensor", "node"]),
    ("gaming", ["game", "gaming", "play", "nft", "metaverse", "rpg"]),
    ("meme season", ["meme", "pepe", "doge", "shib", "wojak", "frog"]),
    ("BNB ecosystem", ["bnb", "binance", "bsc", "pancake", "four"]),
    ("celebrity / culture", ["trump", "elon", "musk", "taylor", "kanye", "celeb"]),
    ("animal meme", ["cat", "dog", "inu", "pepe", "frog", "hamster", "monkey"]),
    ("finance meme", ["bank", "fiat", "fed", "recession", "crash", "inflation"]),
    ("space / sci-fi", ["moon", "mars", "rocket", "galaxy", "space", "alien"]),
]


class SocialScanner:
    async def get_trending_narratives(self) -> list[str]:
        """
        Returns list of currently trending narrative labels.
        Demo: returns a static hot set. Production: scrape Twitter/CoinGecko trends.
        """
        # Simulated trending narratives for demo
        return ["AI agents", "meme season", "BNB ecosystem", "animal meme"]

    def score_token_narrative(self, name: str, symbol: str) -> tuple[int, list[str]]:
        """
        Score how well a token name/symbol aligns with trending narratives.
        Returns (score 0-100, matched_narratives).
        """
        combined = (name + " " + symbol).lower()
        matched = []

        for narrative, keywords in NARRATIVE_KEYWORDS:
            if any(kw in combined for kw in keywords):
                matched.append(narrative)

        if not matched:
            return 30, []

        # More matches = higher narrative score, capped at 95
        score = min(95, 40 + len(matched) * 15)
        return score, matched
