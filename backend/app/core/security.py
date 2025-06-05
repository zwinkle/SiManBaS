# backend/app/core/security.py
from datetime import datetime, timedelta, timezone
from typing import Optional, Any

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
# Anda perlu mengimpor model User dan fungsi CRUD untuk mengambil user
# Ini adalah placeholder, pastikan path importnya benar setelah Anda membuat model dan CRUD.
from app.models.user import User # Asumsi model User ada di app.models.user
# from app.crud.crud_user import get_user_by_username # Akan kita gunakan nanti

# Skema OAuth2 untuk form login, menunjuk ke endpoint login Anda.
# Token URL ini adalah path relatif dari root API Anda.
# Jika API_V1_STR = "/api/v1", dan endpoint login ada di auth.router dengan path "/login",
# maka tokenUrl menjadi "auth/login" relatif terhadap prefix router utama (/api/v1).
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# Konteks untuk hashing password menggunakan bcrypt.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = settings.ALGORITHM
SECRET_KEY = settings.SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Memverifikasi password teks biasa dengan password yang sudah di-hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Menghasilkan hash dari password teks biasa."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Membuat JWT access token.
    :param data: Data yang akan di-encode ke dalam token (biasanya berisi 'sub' - subject/username).
    :param expires_delta: Durasi kustom untuk token kadaluarsa. Jika None, gunakan default.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Pydantic model untuk data di dalam token (payload)
# Sebaiknya ini ada di app.schemas.token, tapi untuk kelengkapan core, kita definisikan di sini sementara.
from pydantic import BaseModel
class TokenData(BaseModel):
    username: Optional[str] = None

async def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """
    Dependensi untuk mendapatkan pengguna saat ini berdasarkan token JWT.
    Mendekode token, mengambil username, dan mengambil data pengguna dari database.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub") # "sub" adalah standar klaim untuk subject (username)
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    # Placeholder: Anda perlu mengimplementasikan fungsi untuk mengambil user berdasarkan username dari database.
    # user = get_user_by_username(db, username=token_data.username) # Ini cara yang ideal menggunakan modul CRUD
    
    # Untuk sementara, agar fungsi ini bisa berjalan tanpa CRUD eksplisit:
    user = db.query(User).filter(User.username == token_data.username).first()

    if user is None:
        raise credentials_exception
    if not user.is_active: # Tambahan check jika Anda ingin memastikan user aktif
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependensi untuk mendapatkan pengguna aktif saat ini.
    Jika Anda tidak memiliki field `is_active` atau logika khusus,
    Anda bisa langsung menggunakan `get_current_user`.
    Fungsi ini ditambahkan jika ada kebutuhan untuk membedakan antara
    mendapatkan user (mungkin non-aktif) dan user yang aktif.
    Jika `get_current_user` sudah menangani `is_active`, fungsi ini mungkin redundan.
    """
    # Logika is_active sudah ditangani di get_current_user,
    # jadi fungsi ini bisa saja hanya me-return current_user atau dihapus jika get_current_user sudah cukup.
    # if not current_user.is_active:
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user