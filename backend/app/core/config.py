# backend/app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional # Optional diimpor tapi tidak digunakan di contoh ini, bisa dihapus jika tidak ada rencana penggunaan.

class Settings(BaseSettings):
    """
    Pengaturan utama aplikasi.
    Variabel akan dimuat dari file .env dan environment variables sistem.
    """
    PROJECT_NAME: str = "SiManBaS API"
    API_V1_STR: str = "/api/v1"

    # Pengaturan Database
    # Contoh: "postgresql://user:password@host:port/dbname"
    DATABASE_URL: str

    # Pengaturan JWT (JSON Web Token)
    # Ini harus berupa string acak yang sangat kuat.
    # Anda bisa membuatnya dengan: openssl rand -hex 32
    SECRET_KEY: str
    ALGORITHM: str = "HS256" # Algoritma yang digunakan untuk encoding JWT.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # Contoh: Token berlaku selama 24 jam.

    # Konfigurasi model Pydantic untuk memuat dari file .env
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Instance global dari Settings yang akan digunakan di seluruh aplikasi.
settings = Settings()