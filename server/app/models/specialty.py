from pydantic import BaseModel


class SpecialtyCreate(BaseModel):
    name: str
    consult_minutes: int
    icon: str


class SpecialtyOut(SpecialtyCreate):
    id: str
