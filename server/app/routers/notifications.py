from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.core.serializers import serialize_doc
from app.database import notifications_col

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(current_user: dict = Depends(get_current_user)):
    docs = (
        await notifications_col.find({"role": current_user["role"], "profile_id": current_user["id"]})
        .sort("time", -1)
        .to_list(length=None)
    )
    return [serialize_doc(d) for d in docs]


@router.patch("/mark-all-read")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    await notifications_col.update_many(
        {"role": current_user["role"], "profile_id": current_user["id"]}, {"$set": {"read": True}}
    )
    return {"ok": True}


@router.delete("")
async def clear_all(current_user: dict = Depends(get_current_user)):
    await notifications_col.delete_many({"role": current_user["role"], "profile_id": current_user["id"]})
    return {"ok": True}
