from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user, get_current_user_optional
from app.core.notify import notify
from app.core.serializers import serialize_doc
from app.core.utils import now_iso
from app.database import doctors_col, patients_col, tokens_col
from app.models.token import CompleteConsultation, TokenCreate, TokenStatusUpdate
from app.routers.config import get_queue_config

router = APIRouter(prefix="/tokens", tags=["tokens"])

DOCTOR_ACTIONS = {"called", "in-consultation", "skipped", "no-show"}


async def _next_token_number(doctor_id: str) -> str:
    count = await tokens_col.count_documents({})
    suffix = doctor_id[-4:]
    return f"T{suffix}-{100 + count}"


@router.get("")
async def list_tokens(
    doctor_id: str | None = None,
    patient_id: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] == "patient":
        patient_id = current_user["id"]
    elif current_user["role"] == "doctor":
        doctor_id = current_user["id"]
    # admin can pass either filter or neither

    query = {}
    if doctor_id:
        query["doctor_id"] = doctor_id
    if patient_id:
        query["patient_id"] = patient_id

    docs = await tokens_col.find(query).sort("booked_at", -1).to_list(length=None)
    return [serialize_doc(d) for d in docs]


@router.post("")
async def book_token(payload: TokenCreate, current_user: dict | None = Depends(get_current_user_optional)):
    if current_user and current_user["role"] == "patient":
        patient_id = current_user["id"]
    elif current_user is None:
        patient_id = None  # guest booking
    else:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only patients or guests can book a token.")

    doctor = await doctors_col.find_one({"_id": ObjectId(payload.doctor_id)})
    if not doctor:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Doctor not found.")

    if payload.type == "emergency":
        config = await get_queue_config()
        today = now_iso()[:10]
        emergency_today = await tokens_col.count_documents(
            {
                "doctor_id": payload.doctor_id,
                "type": "emergency",
                "booked_at": {"$regex": f"^{today}"},
            }
        )
        if emergency_today >= config["emergency_cap_per_doctor_per_day"]:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Emergency token limit ({config['emergency_cap_per_doctor_per_day']}/day) reached for this doctor.",
            )

    token = {
        "token_number": await _next_token_number(payload.doctor_id),
        "doctor_id": payload.doctor_id,
        "patient_id": patient_id,
        "patient_name": payload.patient_name,
        "type": payload.type,
        "status": "waiting",
        "booked_at": now_iso(),
        "slot_time": payload.slot_time,
    }
    result = await tokens_col.insert_one(token)
    doc = await tokens_col.find_one({"_id": result.inserted_id})

    if patient_id:
        await notify(
            "patient",
            patient_id,
            "Token confirmed",
            f"Your token {token['token_number']} with {doctor['name']} is confirmed for {payload.slot_time}.",
        )
    if payload.type == "emergency":
        await notify(
            "doctor",
            payload.doctor_id,
            "Emergency token added",
            f"An emergency token ({token['token_number']}) was added to your queue.",
        )

    return serialize_doc(doc)


@router.patch("/{token_id}/status")
async def update_token_status(
    token_id: str, payload: TokenStatusUpdate, current_user: dict = Depends(get_current_user)
):
    token = await tokens_col.find_one({"_id": ObjectId(token_id)})
    if not token:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Token not found.")

    if payload.status == "cancelled":
        allowed = current_user["role"] == "admin" or current_user["id"] in (
            token.get("patient_id"),
            token.get("doctor_id"),
        )
    elif payload.status in DOCTOR_ACTIONS:
        allowed = current_user["role"] == "admin" or (
            current_user["role"] == "doctor" and current_user["id"] == token["doctor_id"]
        )
    else:
        allowed = False

    if not allowed:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not allowed to change this token's status.")

    await tokens_col.update_one({"_id": ObjectId(token_id)}, {"$set": {"status": payload.status}})
    doc = await tokens_col.find_one({"_id": ObjectId(token_id)})
    return serialize_doc(doc)


@router.post("/{token_id}/complete")
async def complete_consultation(
    token_id: str, payload: CompleteConsultation, current_user: dict = Depends(get_current_user)
):
    token = await tokens_col.find_one({"_id": ObjectId(token_id)})
    if not token:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Token not found.")
    if current_user["role"] != "doctor" or current_user["id"] != token["doctor_id"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the treating doctor can complete this consultation.")

    await tokens_col.update_one({"_id": ObjectId(token_id)}, {"$set": {"status": "completed"}})

    if token.get("patient_id"):
        doctor = await doctors_col.find_one({"_id": ObjectId(token["doctor_id"])})
        entry = {
            "date": now_iso()[:10],
            "doctor": doctor["name"] if doctor else "",
            "specialty": "",
            "diagnosis": payload.diagnosis,
            "notes": payload.notes,
        }
        await patients_col.update_one(
            {"_id": ObjectId(token["patient_id"])}, {"$push": {"medical_history": {"$each": [entry], "$position": 0}}}
        )
        await notify(
            "patient",
            token["patient_id"],
            "Consultation completed",
            f"Dr. notes from your visit ({token['token_number']}) have been added to your medical records.",
        )

    doc = await tokens_col.find_one({"_id": ObjectId(token_id)})
    return serialize_doc(doc)
