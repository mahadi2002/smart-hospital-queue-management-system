from pydantic import BaseModel


class ChangePassword(BaseModel):
    current_password: str
    new_password: str
