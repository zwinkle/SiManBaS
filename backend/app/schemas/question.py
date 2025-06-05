# backend/app/schemas/question.py
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from .answer_option import AnswerOptionUpdate, AnswerOptionRead, AnswerOptionInput # Impor skema AnswerOption
from .user import UserRead

class QuestionBase(BaseModel):
    """
    Atribut dasar untuk soal.
    """
    content: str
    question_type: str # contoh: 'multiple_choice', 'essay'
    subject: Optional[str] = None
    topic: Optional[str] = None
    initial_difficulty_estimate: Optional[str] = None # contoh: 'easy', 'medium', 'hard'
    tags: Optional[List[str]] = None

class QuestionCreate(QuestionBase):
    """
    Skema untuk membuat soal baru.
    Jika tipe soal 'multiple_choice', bisa menyertakan answer_options.
    """
    answer_options: Optional[List[AnswerOptionInput]] = None

class QuestionUpdate(BaseModel):
    """
    Skema untuk memperbarui soal. Semua field opsional.
    """
    content: Optional[str] = None
    question_type: Optional[str] = None
    subject: Optional[str] = None
    topic: Optional[str] = None
    initial_difficulty_estimate: Optional[str] = None
    tags: Optional[List[str]] = None
    answer_options: Optional[List[AnswerOptionInput]] = None

class QuestionRead(QuestionBase):
    """
    Skema untuk membaca data soal.
    """
    id: UUID
    created_by_user_id: UUID
    created_at: datetime
    updated_at: datetime
    answer_options: List[AnswerOptionRead] = [] # Selalu tampilkan list, bisa kosong

    # Jika ingin menampilkan detail pembuat soal:
    # from .user import UserRead # Pindahkan import ini ke atas jika digunakan
    # creator: Optional[UserRead] = None # Tergantung bagaimana Anda memuat relasi di CRUD

    creator: Optional[UserRead] = None

    model_config = ConfigDict(from_attributes=True)