from pydantic import BaseModel


class PackageOut(BaseModel):
    id: str
    name: str
    price: int
    tests: list[str]
    description: str
