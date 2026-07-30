from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user, require_role
from app.core.security import hash_password
from app.core.serializers import serialize_doc, serialize_list
from app.database import doctors_col, specialties_col, tokens_col
from app.models.doctor import DoctorCreate, DoctorUpdate

router = APIRouter(prefix="/doctors", tags=["doctors"])

DEFAULT_DOCTOR_PASSWORD = "doctor123"


def _public(doc: dict) -> dict:
    doc = serialize_doc(doc)
    doc.pop("password_hash", None)
    return doc


@router.get("")
async def list_doctors():
    docs = await doctors_col.find().to_list(length=None)
    return [_public(d) for d in docs]


@router.get("/queue-status")
async def queue_status_all():
    """Public snapshot for the guest directory: what token each doctor is
    currently seeing, how many are waiting, and how long a new booking
    would take right now (waiting_count * consult_minutes, plus one more
    consult if someone is already being seen)."""
    docs = await doctors_col.find().to_list(length=None)
    specialties = await specialties_col.find().to_list(length=None)
    consult_minutes_by_specialty = {str(s["_id"]): s["consult_minutes"] for s in specialties}

    results = []
    for d in docs:
        doctor_id = str(d["_id"])
        consult_minutes = consult_minutes_by_specialty.get(d.get("specialty_id"), 15)

        current = await tokens_col.find_one({"doctor_id": doctor_id, "status": "in-consultation"})
        waiting_count = await tokens_col.count_documents(
            {"doctor_id": doctor_id, "status": {"$in": ["waiting", "called"]}}
        )
        estimated_wait_minutes = waiting_count * consult_minutes + (consult_minutes if current else 0)

        results.append({
            "doctor_id": doctor_id,
            "current_token": current["token_number"] if current else None,
            "waiting_count": waiting_count,
            "estimated_wait_minutes": estimated_wait_minutes,
        })

    return results


@router.get("/{doctor_id}")
async def get_doctor(doctor_id: str):
    doc = await doctors_col.find_one({"_id": ObjectId(doctor_id)})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Doctor not found.")
    return _public(doc)


@router.post("", dependencies=[Depends(require_role("admin"))])
async def create_doctor(payload: DoctorCreate):
    existing = await doctors_col.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "A doctor with this email already exists.")

    doctor = {
        "name": payload.name,
        "specialty_id": payload.specialty_id,
        "qualifications": payload.qualifications,
        "experience_years": payload.experience_years,
        "email": payload.email,
        "phone": payload.phone,
        "password_hash": hash_password(payload.password or DEFAULT_DOCTOR_PASSWORD),
        "working_days": ["Sun", "Mon", "Tue", "Wed", "Thu"],
        "working_hours": "09:00 - 17:00",
        "daily_token_limit": 40,
        "emergency_cap": 8,
        "walk_in_slots": 5,
        "status": "active",
        "bio": "",
        "queue_paused": False,
    }
    result = await doctors_col.insert_one(doctor)
    doc = await doctors_col.find_one({"_id": result.inserted_id})
    return _public(doc)


@router.patch("/{doctor_id}")
async def update_doctor(doctor_id: str, payload: DoctorUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ("admin", "doctor"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not allowed.")
    if current_user["role"] == "doctor" and current_user["id"] != doctor_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only edit your own profile.")

    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        await doctors_col.update_one({"_id": ObjectId(doctor_id)}, {"$set": updates})

    doc = await doctors_col.find_one({"_id": ObjectId(doctor_id)})
    return _public(doc)


@router.patch("/{doctor_id}/queue-pause")
async def set_queue_paused(doctor_id: str, paused: bool, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "doctor" or current_user["id"] != doctor_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the doctor themself can pause their own queue.")

    await doctors_col.update_one({"_id": ObjectId(doctor_id)}, {"$set": {"queue_paused": paused}})
    return {"queue_paused": paused}


@router.delete("/{doctor_id}", dependencies=[Depends(require_role("admin"))])
async def delete_doctor(doctor_id: str):
    active = await tokens_col.count_documents(
        {"doctor_id": doctor_id, "status": {"$in": ["waiting", "called", "in-consultation"]}}
    )
    if active > 0:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Doctor has active tokens and cannot be removed.")

    result = await doctors_col.delete_one({"_id": ObjectId(doctor_id)})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Doctor not found.")
    return {"ok": True}
