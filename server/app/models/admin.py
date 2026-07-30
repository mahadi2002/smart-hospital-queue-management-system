from pydantic import BaseModel, EmailStr


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminUpdate(BaseModel):
    name: str | None = None


class AdminOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    avatar_initials: str
