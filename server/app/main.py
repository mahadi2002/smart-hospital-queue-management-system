from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import admins, auth, config, doctors, notifications, packages, patients, specialties, tokens

app = FastAPI(title="Smart Hospital Queue Management System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admins.router)
app.include_router(doctors.router)
app.include_router(patients.router)
app.include_router(specialties.router)
app.include_router(tokens.router)
app.include_router(notifications.router)
app.include_router(packages.router)
app.include_router(config.router)


@app.get("/")
async def root():
    return {"status": "ok", "service": "smart-hospital-queue-api"}
