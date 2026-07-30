from pydantic import BaseModel, EmailStr


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = ""
    department: str | None = ""
    role: str = "Admin"
    password: str | None = None  # admin can leave blank to use the default demo password


class AdminUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    department: str | None = None


class AdminOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    avatar_initials: str
    phone: str = ""
    department: str = ""
    join_date: str = ""
