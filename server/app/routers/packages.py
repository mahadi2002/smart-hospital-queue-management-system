from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user_optional, require_role
from app.core.notify import notify
from app.core.serializers import serialize_doc
from app.core.utils import now_iso
from app.database import package_reservations_col, packages_col, patients_col
from app.models.package import RESERVATION_STATUSES, PackageReserve, ReservationStatusUpdate

router = APIRouter(prefix="/packages", tags=["packages"])


@router.get("")
async def list_packages():
    docs = await packages_col.find().to_list(length=None)
    return [serialize_doc(d) for d in docs]


@router.get("/reservations", dependencies=[Depends(require_role("admin"))])
async def list_reservations():
    docs = await package_reservations_col.find().sort("created_at", -1).to_list(length=None)
    return [serialize_doc(d) for d in docs]


@router.patch("/reservations/{reservation_id}", dependencies=[Depends(require_role("admin"))])
async def update_reservation_status(reservation_id: str, payload: ReservationStatusUpdate):
    if payload.status not in RESERVATION_STATUSES:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Status must be one of: {', '.join(RESERVATION_STATUSES)}.",
        )

    reservation = await package_reservations_col.find_one({"_id": ObjectId(reservation_id)})
    if not reservation:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reservation not found.")

    await package_reservations_col.update_one(
        {"_id": ObjectId(reservation_id)}, {"$set": {"status": payload.status}}
    )

    # If the reservation belongs to a registered patient, let them know either way.
    if reservation.get("patient_id"):
        if payload.status == "confirmed":
            title, body = (
                "Package confirmed",
                f"Your {reservation['package_name']} reservation is confirmed. "
                "Our team will call you to fix a date.",
            )
        elif payload.status == "cancelled":
            title, body = (
                "Package cancelled",
                f"Your {reservation['package_name']} reservation has been cancelled. "
                "Call us if this wasn't expected.",
            )
        else:
            title, body = None, None
        if title:
            await notify("patient", reservation["patient_id"], title, body)

    doc = await package_reservations_col.find_one({"_id": ObjectId(reservation_id)})
    return serialize_doc(doc)


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
