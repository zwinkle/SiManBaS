import sys
import os # Pastikan os diimpor jika belum
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy.pool import NullPool

from alembic import context

# --- PENYESUAIAN sys.path ---
# Jika env.py ada di backend/alembic/ dan modul 'app' ada di backend/app/
# Maka kita perlu menambahkan 'backend/' ke sys.path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))
# -----------------------------

from app.core.config import settings # Impor settings Anda
from app.db.base import Base # Impor Base Anda yang sudah mendaftarkan semua model

from app.models import *

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.
    # ... (komentar penjelasan bisa dipertahankan atau dihapus sesuai preferensi)
    """
    # Untuk konsistensi, Anda bisa juga menggunakan settings.DATABASE_URL di sini
    # url = settings.DATABASE_URL
    # Atau biarkan mengambil dari alembic.ini jika itu yang diinginkan untuk mode offline
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.
    # ... (komentar penjelasan bisa dipertahankan atau dihapus sesuai preferensi)
    """
    connectable = context.config.attributes.get("connection", None)

    if connectable is None:
        # Ambil URL dari settings.py (via app.core.config)
        db_url = settings.DATABASE_URL
        # Update konfigurasi Alembic saat ini untuk menggunakan URL ini
        current_config = config # config adalah context.config
        current_config.set_main_option("sqlalchemy.url", db_url)
        
        connectable = engine_from_config(
            current_config.get_section(current_config.config_ini_section), # Gunakan current_config
            prefix="sqlalchemy.",
            poolclass=NullPool
        )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()