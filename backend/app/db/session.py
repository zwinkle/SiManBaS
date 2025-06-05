# backend/app/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Membuat SQLAlchemy engine.
# pool_pre_ping=True membantu menangani koneksi yang mungkin terputus.
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# Membuat SessionLocal class yang akan menjadi factory untuk sesi database baru.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependensi FastAPI untuk menyediakan sesi database per request.
    Memastikan sesi database selalu ditutup setelah request selesai.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()