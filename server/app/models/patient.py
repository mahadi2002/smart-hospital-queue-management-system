from pydantic import BaseModel, EmailStr


class PatientRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    dob: str | None = ""
    gender: str | None = ""


class PatientCreateByAdmin(BaseModel):
    name: str
    email: EmailStr
    phone: str
    dob: str | None = ""
    gender: str | None = ""


class PatientLogin(BaseModel):
    email: EmailStr
    password: str


class PatientUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    dob: str | None = None
    gender: str | None = None
    blood_group: str | None = None
    address: str | None = None


class MedicalHistoryEntry(BaseModel):
    date: str
    doctor: str
    specialty: str = ""
    diagnosis: str
    notes: str


class PatientOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str
    dob: str
    gender: str
    blood_group: str
    address: str
    avatar_initials: str
    medical_history: list[dict]
    reports: list[dict]
