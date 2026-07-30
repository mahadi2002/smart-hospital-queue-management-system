from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.core.serializers import serialize_doc
from app.database import admins_col
from app.models.admin import AdminUpdate

router = APIRouter(prefix="/admins", tags=["admins"])


def _public(doc: dict) -> dict:
    doc = serialize_doc(doc)
    doc.pop("password_hash", None)
    return doc


@router.patch("/{admin_id}")
async def update_admin(admin_id: str, payload: AdminUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin" or current_user["id"] != admin_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only edit your own profile.")

    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        await admins_col.update_one({"_id": ObjectId(admin_id)}, {"$set": updates})

    doc = await admins_col.find_one({"_id": ObjectId(admin_id)})
    return _public(doc)
