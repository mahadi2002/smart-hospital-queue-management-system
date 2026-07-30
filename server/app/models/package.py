from pydantic import BaseModel


class PackageOut(BaseModel):
    id: str
    name: str
    price: int
    tests: list[str]
    description: str


class PackageReserve(BaseModel):
    name: str
    phone: str
    email: str | None = None


class PackageReservationOut(BaseModel):
    id: str
    package_id: str
    package_name: str
    name: str
    phone: str
    email: str | None
    patient_id: str | None
    status: str
    created_at: str
