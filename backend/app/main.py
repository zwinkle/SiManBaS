from fastapi import FastAPI
from app.core.config import settings
from app.api.v1.api import api_router_v1 # Akan kita buat nanti

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.include_router(api_router_v1, prefix=settings.API_V1_STR) # Gunakan nama yang diimpor

@app.get("/") # Root endpoint aplikasi
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}!"}