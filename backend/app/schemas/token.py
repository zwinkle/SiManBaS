# backend/app/schemas/token.py
from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    """
    Skema untuk response token JWT saat login berhasil.
    """
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    """
    Skema untuk data (payload) yang disimpan di dalam JWT.
    'sub' (subject) biasanya berisi username atau ID pengguna.
    """
    sub: Optional[str] = None
    # Anda bisa menambahkan klaim lain di sini jika diperlukan, misalnya 'exp' (expiration time)
    # Meskipun 'exp' biasanya ditangani secara otomatis saat pembuatan token.