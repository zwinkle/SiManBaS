# backend/app/schemas/student_response.py
from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

from .question import QuestionRead

class StudentResponseBase(BaseModel):
    """
    Atribut dasar untuk respons siswa.
    """
    question_id: UUID
    student_identifier: str
    test_session_identifier: Optional[str] = None
    response_text: Optional[str] = None # Untuk esai/jawaban singkat
    selected_option_id: Optional[UUID] = None # Untuk pilihan ganda

class StudentResponseCreate(StudentResponseBase):
    """
    Skema untuk membuat (mengirimkan) respons siswa baru.
    """
    is_response_correct: Optional[bool] = None # Bisa diisi saat submit jika langsung diketahui

class StudentResponseRead(StudentResponseBase):
    """
    Skema untuk membaca data respons siswa.
    """
    id: UUID
    submitted_at: datetime
    is_response_correct: Optional[bool] = None
    question: QuestionRead

    model_config = ConfigDict(from_attributes=True)