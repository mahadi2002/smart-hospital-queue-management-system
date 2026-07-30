from pydantic import BaseModel


class NotificationOut(BaseModel):
    id: str
    role: str
    profile_id: str
    title: str
    body: str
    time: str
    read: bool
