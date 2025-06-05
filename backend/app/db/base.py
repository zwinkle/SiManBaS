# backend/app/db/base.py
from sqlalchemy.ext.declarative import declarative_base

# Instance dari declarative_base() yang akan digunakan sebagai kelas dasar
# untuk semua model ORM SQLAlchemy Anda.
Base = declarative_base()

# Import semua model Anda di bawah baris ini agar mereka terdaftar di Base.metadata
# Ini penting untuk Alembic agar dapat melakukan auto-generate migrations
# dan juga jika Anda menggunakan Base.metadata.create_all().

# Contoh: (Pastikan path import sesuai dengan struktur Anda)
from app.models.user import User
from app.models.question import Question
from app.models.answer_option import AnswerOption
from app.models.student_response import StudentResponse
from app.models.item_analysis_result import ItemAnalysisResult