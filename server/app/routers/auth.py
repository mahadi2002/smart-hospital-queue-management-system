from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.core.serializers import serialize_doc
from app.core.utils import initials
from app.database import admins_col, doctors_col, patients_col
from app.models.admin import AdminLogin
from app.models.auth import ChangePassword
from app.models.doctor import DoctorLogin
from app.models.patient import PatientLogin, PatientRegister

router = APIRouter(prefix="/auth", tags=["auth"])

COLLECTION_BY_ROLE = {"patient": patients_col, "doctor": doctors_col, "admin": admins_col}
ARCHIVED_STATUS = "archived"


def _profile_without_password(doc: dict) -> dict:
    doc = serialize_doc(doc)
    doc.pop("password_hash", None)
    return doc


@router.post("/register")
async def register_patient(payload: PatientRegister):
    existing = await patients_col.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "An account with this email already exists.")

    patient = {
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "password_hash": hash_password(payload.password),
        "dob": payload.dob or "",
        "gender": payload.gender or "",
        "blood_group": "",
        "address": "",
        "avatar_initials": initials(payload.name),
        "medical_history": [],
        "reports": [],
    }
    result = await patients_col.insert_one(patient)

    token = create_access_token(subject=str(result.inserted_id), role="patient")
    return {"access_token": token, "role": "patient", "profile_id": str(result.inserted_id)}


@router.post("/login/patient")
async def login_patient(payload: PatientLogin):
    patient = await patients_col.find_one({"email": payload.email})
    if not patient or not verify_password(payload.password, patient["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")

    token = create_access_token(subject=str(patient["_id"]), role="patient")
    return {"access_token": token, "role": "patient", "profile_id": str(patient["_id"])}


@router.post("/login/doctor")
async def login_doctor(payload: DoctorLogin):
    doctor = await doctors_col.find_one({"email": payload.email})
    # A removed doctor keeps their record so old bookings still show who the
    # patient saw, but the password hash is gone — there's nothing left to
    # log in with, and the status check makes that explicit.
    if (
        not doctor
        or doctor.get("status") == ARCHIVED_STATUS
        or not doctor.get("password_hash")
        or not verify_password(payload.password, doctor["password_hash"])
    ):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")

    token = create_access_token(subject=str(doctor["_id"]), role="doctor")
    return {"access_token": token, "role": "doctor", "profile_id": str(doctor["_id"])}


@router.post("/login/admin")
async def login_admin(payload: AdminLogin):
    admin = await admins_col.find_one({"email": payload.email})
    if not admin or not verify_password(payload.password, admin["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")

    token = create_access_token(subject=str(admin["_id"]), role="admin")
    return {"access_token": token, "role": "admin", "profile_id": str(admin["_id"])}


@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    collection = COLLECTION_BY_ROLE[current_user["role"]]

    doc = await collection.find_one({"_id": ObjectId(current_user["id"])})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Profile not found.")

    return {"role": current_user["role"], "profile": _profile_without_password(doc)}


@router.post("/change-password")
async def change_password(payload: ChangePassword, current_user: dict = Depends(get_current_user)):
    """Any logged-in user changes their own password. Works the same for all
    three roles — the token says who you are, so nobody can change someone
    else's password through here."""
    if len(payload.new_password) < 8:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "New password must be at least 8 characters.")
    if payload.new_password == payload.current_password:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "New password must be different from the current one.")

    collection = COLLECTION_BY_ROLE[current_user["role"]]
    doc = await collection.find_one({"_id": ObjectId(current_user["id"])})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Profile not found.")

    if not verify_password(payload.current_password, doc["password_hash"]):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect.")

    await collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"password_hash": hash_password(payload.new_password)}},
    )
    return {"ok": True}
