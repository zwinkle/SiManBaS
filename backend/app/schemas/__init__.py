# backend/app/schemas/__init__.py
# File ini digunakan untuk memudahkan impor skema dari package 'schemas'.

from .token import Token, TokenPayload
from .user import UserCreate, UserRead, UserUpdate, UserBase
from .answer_option import AnswerOptionCreate, AnswerOptionRead, AnswerOptionUpdate, AnswerOptionBase
from .question import QuestionCreate, QuestionRead, QuestionUpdate, QuestionBase
from .student_response import StudentResponseCreate, StudentResponseRead, StudentResponseBase
from .item_analysis_result import ItemAnalysisResultRead, ItemAnalysisResultBase
from .statistics import OptionStatData, QuestionOptionStatsRead

# Anda bisa menambahkan __all__ jika ingin mengontrol apa yang diimpor dengan 'from app.schemas import *'
# __all__ = [
#     "Token", "TokenPayload",
#     "UserCreate", "UserRead", "UserUpdate", "UserBase",
#     "AnswerOptionCreate", "AnswerOptionRead", "AnswerOptionUpdate", "AnswerOptionBase",
#     "QuestionCreate", "QuestionRead", "QuestionUpdate", "QuestionBase",
#     "StudentResponseCreate", "StudentResponseRead", "StudentResponseBase",
#     "ItemAnalysisResultRead", "ItemAnalysisResultBase",
# ]