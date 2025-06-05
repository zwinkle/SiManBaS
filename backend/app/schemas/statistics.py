# backend/app/schemas/statistics.py
from pydantic import BaseModel, ConfigDict
from typing import List
from uuid import UUID

class OptionStatData(BaseModel):
    """
    Data statistik untuk satu pilihan jawaban.
    """
    option_id: UUID
    option_text: str
    is_correct: bool # Tambahkan info apakah ini kunci jawaban
    selection_count: int
    selection_percentage: float # Persentase dari total respons terhadap soal ini

    model_config = ConfigDict(from_attributes=True)

class QuestionOptionStatsRead(BaseModel):
    """
    Skema untuk output statistik pilihan jawaban dari sebuah soal.
    """
    question_id: UUID
    question_content: str
    question_type: str # Tambahkan tipe soal
    total_responses_for_question: int
    options_stats: List[OptionStatData]

    model_config = ConfigDict(from_attributes=True)