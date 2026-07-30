from pydantic import BaseModel

TOKEN_STATUSES = [
    "waiting",
    "called",
    "in-consultation",
    "completed",
    "skipped",
    "cancelled",
    "no-show",
]

TOKEN_TYPES = ["regular", "emergency", "walk-in"]


class TokenCreate(BaseModel):
    doctor_id: str
    patient_id: str | None = None
    patient_name: str
    type: str = "regular"
    slot_time: str


class TokenStatusUpdate(BaseModel):
    status: str


class CompleteConsultation(BaseModel):
    diagnosis: str
    notes: str


class TokenOut(BaseModel):
    id: str
    token_number: str
    doctor_id: str
    patient_id: str | None
    patient_name: str
    type: str
    status: str
    booked_at: str
    slot_time: str
