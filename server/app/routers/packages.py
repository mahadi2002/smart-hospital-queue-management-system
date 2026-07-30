from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user_optional, require_role
from app.core.notify import notify
from app.core.serializers import serialize_doc
from app.core.utils import now_iso
from app.database import package_reservations_col, packages_col, patients_col
from app.models.package import PackageReserve

router = APIRouter(prefix="/packages", tags=["packages"])


@router.get("")
async def list_packages():
    docs = await packages_col.find().to_list(length=None)
    return [serialize_doc(d) for d in docs]


@router.get("/reservations", dependencies=[Depends(require_role("admin"))])
async def list_reservations():
    docs = await package_reservations_col.find().sort("created_at", -1).to_list(length=None)
    return [serialize_doc(d) for d in docs]


@router.post("/{package_id}/reserve")
async def reserve_package(
    package_id: str,
    payload: PackageReserve,
    current_user: dict | None = Depends(get_current_user_optional),
):
    package = await packages_col.find_one({"_id": ObjectId(package_id)})
    if not package:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Package not found.")

    patient_id = None
    email = payload.email
    if current_user and current_user["role"] == "patient":
        patient_id = current_user["id"]
        patient = await patients_col.find_one({"_id": ObjectId(patient_id)})
        if patient and not email:
            email = patient.get("email")

    reservation = {
        "package_id": package_id,
        "package_name": package["name"],
        "name": payload.name,
        "phone": payload.phone,
        "email": email,
        "patient_id": patient_id,
        "status": "pending",
        "created_at": now_iso(),
    }
    result = await package_reservations_col.insert_one(reservation)
    doc = await package_reservations_col.find_one({"_id": result.inserted_id})

    if patient_id:
        await notify(
            "patient",
            patient_id,
            "Package reserved",
            f"Your reservation for {package['name']} has been received. Our team will contact you at {payload.phone}.",
        )

    return serialize_doc(doc)
