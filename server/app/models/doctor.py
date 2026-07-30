from pydantic import BaseModel, EmailStr


class DoctorCreate(BaseModel):
    name: str
    specialty_id: str
    qualifications: str
    experience_years: int
    email: EmailStr
    phone: str
    password: str | None = None  # admin can leave blank to use the default demo password
    consultation_fee: int | None = None
    languages: list[str] | None = None
    room_number: str | None = None


class DoctorLogin(BaseModel):
    email: EmailStr
    password: str


class DoctorUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    working_hours: str | None = None
    bio: str | None = None
    consultation_fee: int | None = None
    languages: list[str] | None = None
    room_number: str | None = None


class DoctorOut(BaseModel):
    id: str
    name: str
    specialty_id: str
    qualifications: str
    experience_years: int
    email: EmailStr
    phone: str
    working_days: list[str]
    working_hours: str
    daily_token_limit: int
    emergency_cap: int
    walk_in_slots: int
    status: str
    bio: str
    queue_paused: bool = False
    consultation_fee: int = 0
    languages: list[str] = []
    room_number: str = ""
