from datetime import datetime, timezone

from app.database import tokens_col
from app.routers.config import get_queue_config


async def expire_overdue_calls(doctor_id: str | None = None) -> None:
    """A token left in "called" status for longer than the timeout + grace
    period means the patient never showed up — auto-cancel it so the queue
    keeps moving, matching the documented no-show timeout rule."""
    config = await get_queue_config()
    limit_minutes = config["no_show_timeout_minutes"] + config["grace_period_minutes"]

    query = {"status": "called", "called_at": {"$exists": True}}
    if doctor_id:
        query["doctor_id"] = doctor_id

    now = datetime.now(timezone.utc)
    async for token in tokens_col.find(query):
        called_at = datetime.fromisoformat(token["called_at"])
        elapsed_minutes = (now - called_at).total_seconds() / 60
        if elapsed_minutes >= limit_minutes:
            await tokens_col.update_one({"_id": token["_id"]}, {"$set": {"status": "no-show"}})
