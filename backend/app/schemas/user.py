# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    """
    Atribut dasar yang dimiliki oleh pengguna, digunakan sebagai basis untuk skema lain.
    """
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: str = "teacher"
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    """
    Skema untuk membuat pengguna baru. Membutuhkan password.
    """
    password: str

class UserUpdate(BaseModel):
    """
    Skema untuk pengguna memperbarui data mereka sendiri.
    Username tidak bisa diubah.
    """
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None # Jika ingin mengizinkan pembaruan password

class UserRead(UserBase):
    """
    Skema untuk membaca data pengguna (misalnya, sebagai response API).
    """
    id: UUID
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class UserUpdateByAdmin(BaseModel):
    """
    Skema untuk admin memperbarui data pengguna.
    """
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None