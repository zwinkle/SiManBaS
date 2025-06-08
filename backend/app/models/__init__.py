# backend/app/models/__init__.py
# File ini menandakan bahwa direktori 'models' adalah sebuah Python package.
# Anda juga bisa mengimpor model di sini agar lebih mudah diakses dari app.models
# Meskipun untuk Alembic dan SQLAlchemy, impor di app.db.base.py lebih krusial.

from .user import User
from .question import Question
from .answer_option import AnswerOption
from .comment import Comment
from .student_response import StudentResponse
from .item_analysis_result import ItemAnalysisResult

# Anda bisa mendefinisikan __all__ jika ingin mengontrol apa yang diimpor dengan 'from app.models import *'
# __all__ = ["User", "Question", "AnswerOption", "StudentResponse", "ItemAnalysisResult"]