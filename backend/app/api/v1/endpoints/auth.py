# backend/app/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app import schemas, crud
from app.db.session import get_db
from app.core.security import create_access_token, verify_password # get_password_hash tidak dipakai di login, tapi di register
from app.core.config import settings
# Model User tidak perlu diimpor di sini jika kita pakai CRUD

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
async def login_for_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    Endpoint untuk login pengguna dan mendapatkan access token.
    """
    user = crud.user.get_by_username(db, username=form_data.username) # Menggunakan CRUD
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires # Menggunakan username sebagai subject token
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """
    Endpoint untuk registrasi pengguna baru.
    """
    existing_user_by_email = crud.user.get_by_email(db, email=user_in.email) # Menggunakan CRUD
    if existing_user_by_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists.",
        )
    existing_user_by_username = crud.user.get_by_username(db, username=user_in.username) # Menggunakan CRUD
    if existing_user_by_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this username already exists.",
        )

    # Fungsi create di CRUDUser sudah menangani hashing password
    db_user = crud.user.create(db=db, obj_in=user_in) # Menggunakan CRUD
    return db_user