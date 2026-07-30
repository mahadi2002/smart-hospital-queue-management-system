from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.core.serializers import serialize_doc
from app.database import doctors_col, specialties_col
from app.models.specialty import SpecialtyCreate

router = APIRouter(prefix="/specialties", tags=["specialties"])


@router.get("")
async def list_specialties():
    docs = await specialties_col.find().to_list(length=None)
    return [serialize_doc(d) for d in docs]


@router.post("", dependencies=[Depends(require_role("admin"))])
async def create_specialty(payload: SpecialtyCreate):
    result = await specialties_col.insert_one(payload.model_dump())
    doc = await specialties_col.find_one({"_id": result.inserted_id})
    return serialize_doc(doc)


@router.delete("/{specialty_id}", dependencies=[Depends(require_role("admin"))])
async def delete_specialty(specialty_id: str):
    assigned = await doctors_col.count_documents({"specialty_id": specialty_id})
    if assigned > 0:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"{assigned} doctor(s) are still assigned to this specialty.")

    result = await specialties_col.delete_one({"_id": ObjectId(specialty_id)})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Specialty not found.")
    return {"ok": True}
