from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings

client = AsyncIOMotorClient(settings.mongo_uri)
db = client[settings.mongo_db_name]

patients_col = db["patients"]
doctors_col = db["doctors"]
admins_col = db["admins"]
specialties_col = db["specialties"]
tokens_col = db["tokens"]
notifications_col = db["notifications"]
packages_col = db["packages"]
settings_col = db["settings"]
package_reservations_col = db["package_reservations"]
