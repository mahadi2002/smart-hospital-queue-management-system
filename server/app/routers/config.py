from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.database import settings_col
from app.models.queue_config import QueueConfig

router = APIRouter(prefix="/config", tags=["config"])

CONFIG_DOC_ID = "queue_config"


async def get_queue_config() -> dict:
    doc = await settings_col.find_one({"_id": CONFIG_DOC_ID})
    if not doc:
        default = QueueConfig().model_dump()
        default["_id"] = CONFIG_DOC_ID
        await settings_col.insert_one(default)
        return QueueConfig().model_dump()
    doc.pop("_id")
    return doc


@router.get("")
async def read_config():
    return await get_queue_config()


@router.patch("", dependencies=[Depends(require_role("admin"))])
async def update_config(payload: QueueConfig):
    await settings_col.update_one(
        {"_id": CONFIG_DOC_ID}, {"$set": payload.model_dump()}, upsert=True
    )
    return payload.model_dump()
