"""
AI Analyzer — uses Claude API to score memecoin risk/opportunity.
Model: claude-haiku-4-5-20251001 (cost-efficient for bulk analysis).
"""
import json
import logging
import re

import anthropic

import config
from social_scanner import SocialScanner

logger = logging.getLogger(__name__)

ANALYSIS_PROMPT = """\
You are MemeGuard AI, an expert memecoin risk analyst on BNB Chain.

Analyze this newly launched memecoin on Four.Meme and provide a risk/opportunity assessment.

TOKEN DATA:
- Name: {name}
- Symbol: {symbol}
- Contract: {address}
- Creator: {creator}
- Creator History: {creator_history}
- Initial Liquidity: {liquidity_bnb} BNB
- Top-10 Holder Concentration: {top10_concentration}%
- Total Holders: {holder_count}
- Contract Verified: {contract_verified}
- Trending Narratives: {narratives}

Respond in this exact JSON format with no extra text:
{{
  "safety_score": <integer 0-100>,
  "alpha_score": <integer 0-100>,
  "narrative_score": <integer 0-100>,
  "overall_score": <integer 0-100>,
  "analysis_text": "<2-3 sentence analysis>",
  "flags": ["flag1", "flag2"],
  "recommendation": "WATCH"
}}

Scoring rules:
- safety_score: Penalize heavily for >50% holder concentration, unverified contract, creator with rug history. 100 = very safe.
- alpha_score: Reward low initial mcap, strong narrative alignment, growing holder count. 100 = high potential.
- narrative_score: How well does the meme align with current trending crypto/cultural narratives? 100 = perfect fit.
- overall_score: Weighted average — safety 40% + alpha 35% + narrative 25%.
- recommendation must be exactly "WATCH", "ENTER", or "AVOID".
- flags examples: "high_concentration", "unverified_contract", "creator_rug_history", "low_liquidity", "strong_narrative", "clean_creator".
"""

CREATOR_HISTORY_PROMPT = """\
You are a blockchain forensics expert. Based on the wallet address {creator}, provide a brief risk assessment.
Since you cannot access live blockchain data, provide a realistic placeholder assessment.

Respond in JSON:
{{
  "risk_level": "LOW" | "MEDIUM" | "HIGH",
  "previous_rugs": <integer>,
  "summary": "<1 sentence>"
}}
"""


class TokenAnalyzer:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
        self.social = SocialScanner()

    async def analyze_token(self, token_data: dict) -> dict:
        creator_history = await self.get_creator_history(token_data.get("creator", "unknown"))
        narratives = await self.social.get_trending_narratives()

        prompt = ANALYSIS_PROMPT.format(
            name=token_data.get("name", "Unknown"),
            symbol=token_data.get("symbol", "???"),
            address=token_data.get("address", ""),
            creator=token_data.get("creator", "unknown"),
            creator_history=creator_history.get("summary", "No history available"),
            liquidity_bnb=token_data.get("liquidity_bnb", 0),
            top10_concentration=token_data.get("top10_concentration", 100),
            holder_count=token_data.get("holder_count", 1),
            contract_verified=token_data.get("contract_verified", False),
            narratives=", ".join(narratives) if narratives else "none detected",
        )

        try:
            response = self.client.messages.create(
                model=config.ANALYSIS_MODEL,
                max_tokens=512,
                messages=[{"role": "user", "content": prompt}],
            )
            raw = response.content[0].text.strip()
            result = self._parse_response(raw)
        except Exception as exc:
            logger.error("Claude API error for %s: %s", token_data.get("address"), exc)
            result = self._fallback_score(token_data)

        return {
            "token_address": token_data["address"],
            **result,
        }

    async def get_creator_history(self, creator: str) -> dict:
        if creator in ("unknown", "", "0x0000000000000000000000000000000000000000"):
            return {"risk_level": "HIGH", "previous_rugs": 0, "summary": "Unknown creator"}
        try:
            response = self.client.messages.create(
                model=config.ANALYSIS_MODEL,
                max_tokens=128,
                messages=[{"role": "user", "content": CREATOR_HISTORY_PROMPT.format(creator=creator)}],
            )
            raw = response.content[0].text.strip()
            return self._extract_json(raw) or {"risk_level": "MEDIUM", "previous_rugs": 0, "summary": "Unable to assess"}
        except Exception:
            return {"risk_level": "MEDIUM", "previous_rugs": 0, "summary": "Assessment unavailable"}

    def calculate_holder_concentration(self, holders: dict) -> float:
        """Calculate top-10 holder concentration as percentage of total supply."""
        if not holders or "top_holders" not in holders:
            return 100.0
        top10 = sorted(holders.get("top_holders", []), reverse=True)[:10]
        total = holders.get("total_supply", 1) or 1
        return round(sum(top10) / total * 100, 2)

    def _parse_response(self, raw: str) -> dict:
        data = self._extract_json(raw)
        if not data:
            logger.warning("Failed to parse Claude response: %s", raw[:200])
            return self._default_score()

        # Clamp all scores to 0-100
        for field in ("safety_score", "alpha_score", "narrative_score", "overall_score"):
            data[field] = max(0, min(100, int(data.get(field, 50))))

        valid_recs = {"WATCH", "ENTER", "AVOID"}
        if data.get("recommendation") not in valid_recs:
            data["recommendation"] = "WATCH"

        if not isinstance(data.get("flags"), list):
            data["flags"] = []

        return data

    def _extract_json(self, text: str) -> dict | None:
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except json.JSONDecodeError:
                    return None
        return None

    def _fallback_score(self, token_data: dict) -> dict:
        """Rule-based fallback when Claude API fails."""
        concentration = token_data.get("top10_concentration", 100)
        liquidity = token_data.get("liquidity_bnb", 0)
        verified = token_data.get("contract_verified", False)

        safety = 50
        if concentration > 80:
            safety -= 30
        elif concentration > 50:
            safety -= 15
        if not verified:
            safety -= 10
        if liquidity < 1:
            safety -= 10
        safety = max(0, min(100, safety))

        alpha = 40 if liquidity < 5 else 30
        narrative = 50

        overall = int(safety * 0.4 + alpha * 0.35 + narrative * 0.25)

        flags = []
        if concentration > 50:
            flags.append("high_concentration")
        if not verified:
            flags.append("unverified_contract")
        if liquidity < 1:
            flags.append("low_liquidity")

        recommendation = "AVOID" if safety < 30 else ("ENTER" if overall >= 70 else "WATCH")

        return {
            "safety_score": safety,
            "alpha_score": alpha,
            "narrative_score": narrative,
            "overall_score": overall,
            "analysis_text": "Fallback analysis — Claude API unavailable. Scores based on on-chain heuristics only.",
            "flags": flags,
            "recommendation": recommendation,
        }

    def _default_score(self) -> dict:
        return {
            "safety_score": 50,
            "alpha_score": 50,
            "narrative_score": 50,
            "overall_score": 50,
            "analysis_text": "Analysis unavailable — parse error.",
            "flags": [],
            "recommendation": "WATCH",
        }
