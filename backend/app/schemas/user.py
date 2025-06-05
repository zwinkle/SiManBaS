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
    Skema untuk memperbarui data pengguna. Semua field bersifat opsional.
    """
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None # Jika ingin mengizinkan pembaruan password

class UserRead(UserBase):
    """
    Skema untuk membaca data pengguna (misalnya, sebagai response API).
    Tidak menyertakan password.
    """
    id: UUID
    created_at: datetime
    updated_at: datetime

    # Konfigurasi Pydantic untuk mode ORM (memuat data dari objek SQLAlchemy)
    model_config = ConfigDict(from_attributes=True)

# Anda bisa juga membuat UserInDBBase atau UserInDB jika perlu skema yang
# merepresentasikan data lengkap di DB termasuk hashed_password, tapi biasanya
# UserRead sudah cukup untuk output API.