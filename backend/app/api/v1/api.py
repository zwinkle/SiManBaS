# backend/app/api/v1/api.py
from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, questions, responses, analysis, statistics

api_router_v1 = APIRouter()

# Menyertakan router dari setiap modul endpoint
api_router_v1.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router_v1.include_router(users.router, prefix="/users", tags=["Users"])
api_router_v1.include_router(questions.router, prefix="/questions", tags=["Questions"])
api_router_v1.include_router(responses.router, prefix="/responses", tags=["Student Responses"])
api_router_v1.include_router(analysis.router, prefix="/analysis", tags=["Item Analysis"])
api_router_v1.include_router(statistics.router, prefix="/statistics", tags=["Statistics"])

# Anda bisa menambahkan endpoint lain langsung di sini jika perlu,
# misalnya endpoint untuk health check v1 API.
@api_router_v1.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "API v1 is healthy"}