# backend/app/schemas/__init__.py
# File ini digunakan untuk memudahkan impor skema dari package 'schemas'.

from .token import Token, TokenPayload
from .user import UserCreate, UserRead, UserUpdate, UserBase, UserUpdateByAdmin
from .answer_option import AnswerOptionCreate, AnswerOptionRead, AnswerOptionUpdate, AnswerOptionBase
from .comment import CommentBase, CommentCreate, CommentRead, CommentUpdate
from .question import QuestionCreate, QuestionRead, QuestionUpdate, QuestionBase, QuestionPage
from .student_response import StudentResponseCreate, StudentResponseRead, StudentResponseBase
from .item_analysis_result import ItemAnalysisResultRead, ItemAnalysisResultBase
from .statistics import OptionStatData, QuestionOptionStatsRead, AdminDashboardStats, TeacherDashboardStats, ItemAnalysisResultReadForStats, StudentScoresInput
from .test_session import TestSessionBase, TestSessionCreate, TestSessionRead, TestSessionUpdate, QuestionIDList
from .bulk_upload import BulkUploadResponse, UploadErrorDetail
from .roster import StudentBase, StudentCreate, StudentRead, RosterBase, RosterCreate, RosterRead, RosterUpdate

# Anda bisa menambahkan __all__ jika ingin mengontrol apa yang diimpor dengan 'from app.schemas import *'
# __all__ = [
#     "Token", "TokenPayload",
#     "UserCreate", "UserRead", "UserUpdate", "UserBase",
#     "AnswerOptionCreate", "AnswerOptionRead", "AnswerOptionUpdate", "AnswerOptionBase",
#     "QuestionCreate", "QuestionRead", "QuestionUpdate", "QuestionBase",
#     "StudentResponseCreate", "StudentResponseRead", "StudentResponseBase",
#     "ItemAnalysisResultRead", "ItemAnalysisResultBase",
# ]