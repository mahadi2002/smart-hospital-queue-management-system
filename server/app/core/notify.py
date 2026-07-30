from app.core.utils import now_iso
from app.database import notifications_col


async def notify(role: str, profile_id: str, title: str, body: str):
    if not profile_id:
        return
    await notifications_col.insert_one(
        {
            "role": role,
            "profile_id": profile_id,
            "title": title,
            "body": body,
            "time": now_iso(),
            "read": False,
        }
    )
