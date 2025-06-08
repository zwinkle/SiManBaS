# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router_v1

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# --- 2. Tambahkan Konfigurasi CORS ---
# Ini harus ditambahkan sebelum router di-include
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"], # Izinkan semua metode (GET, POST, dll.)
    allow_headers=["*"], # Izinkan semua header
)
# ------------------------------------

# Tambahkan router utama untuk API v1
app.include_router(api_router_v1, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}!"}