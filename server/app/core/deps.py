from bson import ObjectId
from bson.errors import InvalidId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_access_token
from app.database import admins_col, doctors_col, patients_col

bearer_scheme = HTTPBearer(auto_error=False)

_COLLECTION_BY_ROLE = {"patient": patients_col, "doctor": doctors_col, "admin": admins_col}


async def _account_is_usable(role: str, user_id: str) -> bool:
    """A token stays cryptographically valid until it expires, so without this
    a doctor removed five minutes ago could keep working for the rest of the
    day. Re-check the account on each request instead of trusting the token
    alone."""
    collection = _COLLECTION_BY_ROLE.get(role)
    if collection is None:
        return False
    try:
        doc = await collection.find_one({"_id": ObjectId(user_id)})
    except InvalidId:
        return False
    return doc is not None and doc.get("status") != "archived"


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")

    if not await _account_is_usable(payload["role"], payload["sub"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "This account is no longer active")

    return {"id": payload["sub"], "role": payload["role"]}


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict | None:
    if credentials is None:
        return None
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        return None
    if not await _account_is_usable(payload["role"], payload["sub"]):
        return None  # treat a dead account as a guest rather than erroring
    return {"id": payload["sub"], "role": payload["role"]}


def require_role(*allowed_roles: str):
    async def checker(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user["role"] not in allowed_roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Not allowed for this role")
        return current_user

    return checker
