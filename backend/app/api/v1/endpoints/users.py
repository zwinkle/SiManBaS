# backend/app/api/v1/endpoints/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from uuid import UUID

from app import schemas, crud
from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models.user import User

router = APIRouter()

def get_current_active_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Dependensi untuk memeriksa apakah pengguna saat ini adalah admin yang aktif.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

# --- URUTAN ENDPOINT DIPERBAIKI ---
# Endpoint yang lebih spesifik ("/me") harus didefinisikan SEBELUM
# endpoint yang lebih umum/dinamis ("/{user_id}").

@router.get("/me", response_model=schemas.UserRead)
async def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    """
    Mendapatkan detail pengguna yang sedang login dan aktif.
    """
    return current_user

@router.put("/me", response_model=schemas.UserRead)
async def update_user_me(
    user_in: schemas.UserUpdate, # Menggunakan skema UserUpdate yang sudah diperbaiki
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Memperbarui detail pengguna yang sedang login.
    """
    updated_user = crud.user.update(db, db_obj=current_user, obj_in=user_in)
    return updated_user

# Endpoint untuk admin sekarang berada di bawah endpoint /me

@router.get("/all", response_model=List[schemas.UserRead], dependencies=[Depends(get_current_active_admin)])
async def read_all_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Mengambil daftar semua pengguna. Hanya bisa diakses oleh admin.
    """
    users = crud.user.get_multi(db, skip=skip, limit=limit)
    return users

@router.put("/{user_id}", response_model=schemas.UserRead, dependencies=[Depends(get_current_active_admin)])
async def update_user_by_admin(
    user_id: UUID,
    user_in: schemas.UserUpdateByAdmin,
    db: Session = Depends(get_db),
):
    """
    Memperbarui data pengguna berdasarkan ID. Hanya bisa diakses oleh admin.
    """
    user_to_update = crud.user.get(db, id=user_id)
    if not user_to_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this ID does not exist in the system",
        )
    
    updated_user = crud.user.update(db, db_obj=user_to_update, obj_in=user_in)
    return updated_user
