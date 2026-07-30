from app.core.serializers import serialize_doc
from app.database import packages_col
from fastapi import APIRouter

router = APIRouter(prefix="/packages", tags=["packages"])


@router.get("")
async def list_packages():
    docs = await packages_col.find().to_list(length=None)
    return [serialize_doc(d) for d in docs]
