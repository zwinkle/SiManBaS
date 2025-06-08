# backend/app/db/base.py

from sqlalchemy.ext.declarative import declarative_base

# Base class yang akan di-inherit oleh semua model SQLAlchemy Anda.
# File ini TIDAK BOLEH mengimpor model apa pun untuk menghindari circular imports.
Base = declarative_base()