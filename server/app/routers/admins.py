from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user, require_role
from app.core.security import hash_password
from app.core.serializers import serialize_doc
from app.core.utils import initials, now_iso
from app.database import admins_col
from app.models.admin import AdminCreate, AdminUpdate

router = APIRouter(prefix="/admins", tags=["admins"])

DEFAULT_ADMIN_PASSWORD = "admin123"


def _public(doc: dict) -> dict:
    doc = serialize_doc(doc)
    doc.pop("password_hash", None)
    return doc


@router.get("", dependencies=[Depends(require_role("admin"))])
async def list_admins():
    docs = await admins_col.find().to_list(length=None)
    return [_public(d) for d in docs]


@router.post("", dependencies=[Depends(require_role("admin"))])
async def create_admin(payload: AdminCreate):
    existing = await admins_col.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "An admin with this email already exists.")

    admin = {
        "name": payload.name,
        "email": payload.email,
        "password_hash": hash_password(payload.password or DEFAULT_ADMIN_PASSWORD),
        "role": payload.role,
        "avatar_initials": initials(payload.name),
        "phone": payload.phone or "",
        "department": payload.department or "",
        "join_date": now_iso()[:10],
    }
    result = await admins_col.insert_one(admin)
    doc = await admins_col.find_one({"_id": result.inserted_id})
    return _public(doc)


@router.patch("/{admin_id}")
async def update_admin(admin_id: str, payload: AdminUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin" or current_user["id"] != admin_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only edit your own profile.")

    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        await admins_col.update_one({"_id": ObjectId(admin_id)}, {"$set": updates})

    doc = await admins_col.find_one({"_id": ObjectId(admin_id)})
    return _public(doc)


@router.delete("/{admin_id}", dependencies=[Depends(require_role("admin"))])
async def delete_admin(admin_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["id"] == admin_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You cannot remove your own account.")

    result = await admins_col.delete_one({"_id": ObjectId(admin_id)})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Admin not found.")
    return {"ok": True}
