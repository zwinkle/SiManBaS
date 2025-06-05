# backend/app/db/init_db.py
import logging
from sqlalchemy.orm import Session

from app.db import base # Untuk memastikan semua model ter-load oleh Base.metadata
from app.db.session import engine, SessionLocal
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User # Asumsi model User sudah ada

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Data untuk superuser pertama.
# Idealnya, ini diambil dari settings (misal, settings.FIRST_SUPERUSER_EMAIL)
# Untuk contoh ini, kita definisikan di sini atau Anda bisa menambahkannya ke config.py
FIRST_SUPERUSER_EMAIL: str = "admin@simanbas.id"
FIRST_SUPERUSER_USERNAME: str = "admin"
FIRST_SUPERUSER_PASSWORD: str = "admin" # Ganti dengan password yang kuat di environment sebenarnya!

def init_db(db: Session) -> None:
    """
    Inisialisasi database. Membuat tabel jika belum ada dan membuat superuser pertama.
    """
    # Membuat semua tabel di database berdasarkan model SQLAlchemy yang terdaftar di Base.metadata.
    # Dalam alur kerja produksi dengan Alembic, ini mungkin tidak selalu diperlukan
    # karena Alembic yang seharusnya mengelola skema database.
    # Namun, ini berguna untuk setup cepat atau lingkungan tes.
    logger.info("Mencoba membuat tabel database (jika belum ada)...")
    base.Base.metadata.create_all(bind=engine)
    logger.info("Proses pembuatan tabel selesai.")

    user = db.query(User).filter(User.email == FIRST_SUPERUSER_EMAIL).first()
    if not user:
        logger.info(f"Membuat superuser pertama: {FIRST_SUPERUSER_EMAIL}")
        hashed_password = get_password_hash(FIRST_SUPERUSER_PASSWORD)
        user_in = User(
            email=FIRST_SUPERUSER_EMAIL,
            username=FIRST_SUPERUSER_USERNAME,
            hashed_password=hashed_password,
            is_active=True,
            role="admin" # Pastikan role 'admin' sesuai dengan logika aplikasi Anda
        )
        db.add(user_in)
        db.commit()
        db.refresh(user_in)
        logger.info(f"Superuser {FIRST_SUPERUSER_EMAIL} berhasil dibuat.")
    else:
        logger.info(f"Superuser {FIRST_SUPERUSER_EMAIL} sudah ada di database.")

def main() -> None:
    logger.info("Memulai proses inisialisasi database...")
    db = SessionLocal()
    try:
        init_db(db)
        logger.info("Inisialisasi database berhasil diselesaikan.")
    except Exception as e:
        logger.error(f"Terjadi error saat inisialisasi database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Skrip ini bisa dijalankan langsung dari terminal untuk inisialisasi:
    # python -m app.db.init_db
    main()