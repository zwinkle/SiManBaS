# backend/app/api/v1/endpoints/statistics.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas
from app.db.session import get_db
from app.core.security import get_current_active_user
from app.api.v1.endpoints.users import get_current_active_admin # Impor dependensi admin
from app.models.user import User
from app.services.statistics_service import statistics_service

router = APIRouter()

@router.get(
    "/admin-dashboard",
    response_model=schemas.AdminDashboardStats,
    dependencies=[Depends(get_current_active_admin)] # Hanya admin yang bisa akses
)
def get_admin_dashboard_statistics(
    db: Session = Depends(get_db),
):
    """
    Mengambil data statistik ringkasan untuk dashboard admin.
    """
    return statistics_service.get_admin_dashboard_stats(db=db)

@router.get(
    "/teacher-dashboard",
    response_model=schemas.TeacherDashboardStats
)
def get_teacher_dashboard_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mengambil data statistik personal untuk dashboard pengajar.
    """
    return statistics_service.get_teacher_dashboard_stats(db=db, current_user=current_user)