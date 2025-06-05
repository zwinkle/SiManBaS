# backend/app/api/v1/endpoints/users.py
from fastapi import APIRouter, Depends, HTTPException, status # status tidak terpakai di sini
from sqlalchemy.orm import Session
from typing import Any

from app import schemas, crud # <--- IMPORT crud
from app.db.session import get_db
from app.core.security import get_current_active_user # get_password_hash tidak perlu diimpor di sini, sudah dihandle CRUD
from app.models.user import User # Model User untuk dependensi get_current_active_user

router = APIRouter()

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
    user_in: schemas.UserUpdate, # Skema UserUpdate digunakan di sini
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Memperbarui detail pengguna yang sedang login.
    """
    # crud.user.update akan menangani hashing password jika ada di user_in
    updated_user = crud.user.update(db, db_obj=current_user, obj_in=user_in) # Menggunakan CRUD
    return updated_user