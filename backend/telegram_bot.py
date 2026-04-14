"""
Telegram Alert Bot — sends formatted alerts for high-scoring tokens.
Rate limit: max 1 alert per token, max 10 per hour.
"""
import logging

import config
import database as db

logger = logging.getLogger(__name__)

ALERT_TEMPLATE = """\
🚨 *MemeGuard AI Alert* 🚨

🪙 *${symbol}* ({name})
📊 Score: *{overall_score}/100* {trend}
🛡️ Safety: {safety_score} | 🎯 Alpha: {alpha_score} | 📈 Narrative: {narrative_score}

💬 _{analysis_text}_

⚡ Recommendation: *{recommendation}*
🔗 [Four.Meme](https://four.meme/token/{address}) | [BSCScan](https://bscscan.com/token/{address})

⚠️ DYOR — Not financial advice
"""

RUG_WARNING_TEMPLATE = """\
⚠️ *MemeGuard Rug Warning* ⚠️

🪙 *${symbol}* ({name})
📊 Score: *{overall_score}/100* 🔴
🚩 Flags: {flags}

💬 _{analysis_text}_

❌ Recommendation: *AVOID*
🔗 [BSCScan](https://bscscan.com/token/{address})

⚠️ High risk detected — exercise extreme caution
"""


class TelegramAlerter:
    def __init__(self):
        self._bot = None
        self._enabled = bool(config.TELEGRAM_BOT_TOKEN and config.TELEGRAM_CHAT_ID)
        if not self._enabled:
            logger.warning("Telegram not configured — alerts will be logged only")

    def _get_bot(self):
        if self._bot is None and self._enabled:
            from telegram import Bot
            self._bot = Bot(token=config.TELEGRAM_BOT_TOKEN)
        return self._bot

    async def maybe_send_alert(self, token: dict, score: dict) -> None:
        overall = score.get("overall_score", 0)
        recommendation = score.get("recommendation", "WATCH")
        address = token.get("address", "")

        if await db.alert_already_sent(address):
            return
        if await db.count_alerts_last_hour() >= config.MAX_ALERTS_PER_HOUR:
            logger.info("Alert rate limit reached — skipping %s", address)
            return

        if overall >= config.ALERT_SCORE_THRESHOLD:
            await self._send_opportunity_alert(token, score)
        elif overall < 30 and recommendation == "AVOID":
            await self._send_rug_warning(token, score)

    async def _send_opportunity_alert(self, token: dict, score: dict) -> None:
        address = token.get("address", "")
        trend = "⬆️" if score.get("overall_score", 0) >= 80 else "➡️"
        flags_str = ", ".join(score.get("flags", [])) or "none"

        text = ALERT_TEMPLATE.format(
            symbol=token.get("symbol", "???"),
            name=token.get("name", "Unknown"),
            overall_score=score.get("overall_score", 0),
            safety_score=score.get("safety_score", 0),
            alpha_score=score.get("alpha_score", 0),
            narrative_score=score.get("narrative_score", 0),
            analysis_text=score.get("analysis_text", ""),
            recommendation=score.get("recommendation", "WATCH"),
            address=address,
            trend=trend,
        )

        await self._dispatch(text, address, "opportunity")

    async def _send_rug_warning(self, token: dict, score: dict) -> None:
        address = token.get("address", "")
        flags_str = ", ".join(score.get("flags", [])) or "none"

        text = RUG_WARNING_TEMPLATE.format(
            symbol=token.get("symbol", "???"),
            name=token.get("name", "Unknown"),
            overall_score=score.get("overall_score", 0),
            analysis_text=score.get("analysis_text", ""),
            flags=flags_str,
            address=address,
        )

        await self._dispatch(text, address, "rug_warning")

    async def _dispatch(self, text: str, token_address: str, alert_type: str) -> None:
        if self._enabled:
            try:
                bot = self._get_bot()
                await bot.send_message(
                    chat_id=config.TELEGRAM_CHAT_ID,
                    text=text,
                    parse_mode="Markdown",
                    disable_web_page_preview=True,
                )
                logger.info("Telegram alert sent: %s [%s]", token_address, alert_type)
            except Exception as exc:
                logger.error("Telegram send failed: %s", exc)
        else:
            logger.info("[Telegram disabled] %s alert for %s:\n%s", alert_type, token_address, text)

        await db.record_alert(token_address, alert_type)
