from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user, require_role
from app.core.security import hash_password
from app.core.serializers import serialize_doc
from app.core.utils import initials
from app.database import patients_col, tokens_col
from app.models.patient import PatientCreateByAdmin, PatientUpdate

router = APIRouter(prefix="/patients", tags=["patients"])

DEFAULT_PATIENT_PASSWORD = "password123"


def _public(doc: dict) -> dict:
    doc = serialize_doc(doc)
    doc.pop("password_hash", None)
    return doc


@router.get("", dependencies=[Depends(require_role("admin"))])
async def list_patients():
    docs = await patients_col.find().to_list(length=None)
    return [_public(d) for d in docs]


@router.get("/{patient_id}")
async def get_patient(patient_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ("admin", "doctor") and current_user["id"] != patient_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not allowed.")

    doc = await patients_col.find_one({"_id": ObjectId(patient_id)})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Patient not found.")
    return _public(doc)


@router.post("", dependencies=[Depends(require_role("admin"))])
async def create_patient(payload: PatientCreateByAdmin):
    existing = await patients_col.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "A patient with this email already exists.")

    patient = {
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "password_hash": hash_password(DEFAULT_PATIENT_PASSWORD),
        "dob": payload.dob or "",
        "gender": payload.gender or "",
        "blood_group": "",
        "address": "",
        "avatar_initials": initials(payload.name),
        "medical_history": [],
        "reports": [],
    }
    result = await patients_col.insert_one(patient)
    doc = await patients_col.find_one({"_id": result.inserted_id})
    return _public(doc)


@router.patch("/{patient_id}")
async def update_patient(patient_id: str, payload: PatientUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin" and current_user["id"] != patient_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only edit your own profile.")

    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        await patients_col.update_one({"_id": ObjectId(patient_id)}, {"$set": updates})

    doc = await patients_col.find_one({"_id": ObjectId(patient_id)})
    return _public(doc)


@router.delete("/{patient_id}", dependencies=[Depends(require_role("admin"))])
async def delete_patient(patient_id: str):
    await tokens_col.delete_many({"patient_id": patient_id})
    result = await patients_col.delete_one({"_id": ObjectId(patient_id)})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Patient not found.")
    return {"ok": True}
