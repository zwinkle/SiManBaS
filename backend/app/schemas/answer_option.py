# backend/app/schemas/answer_option.py
from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID

class AnswerOptionBase(BaseModel):
    """
    Atribut dasar untuk pilihan jawaban.
    """
    option_text: str
    is_correct: bool = False
    display_order: Optional[int] = None

class AnswerOptionCreate(AnswerOptionBase):
    """
    Skema untuk membuat pilihan jawaban baru.
    """
    pass # Tidak ada field tambahan dari Base untuk create

class AnswerOptionInput(AnswerOptionBase): # Atau bisa juga: AnswerOptionInput = AnswerOptionBase
    """
    Skema untuk data input pilihan jawaban, digunakan saat membuat atau
    memperbarui (dengan strategi hapus-dan-buat-ulang) answer options.
    """
    pass

class AnswerOptionUpdate(BaseModel):
    """
    Skema untuk memperbarui pilihan jawaban. Semua field opsional.
    """
    option_text: Optional[str] = None
    is_correct: Optional[bool] = None
    display_order: Optional[int] = None

class AnswerOptionRead(AnswerOptionBase):
    """
    Skema untuk membaca data pilihan jawaban.
    """
    id: UUID
    # question_id: UUID # Biasanya tidak perlu ditampilkan di sini jika sudah nested di QuestionRead

    model_config = ConfigDict(from_attributes=True)