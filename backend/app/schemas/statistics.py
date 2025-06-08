# backend/app/schemas/statistics.py
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict
from uuid import UUID
from .user import UserRead  # Untuk menampilkan detail pembuat soal
from .question import QuestionRead # Untuk menampilkan detail soal

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

class AdminDashboardStats(BaseModel):
    """
    Skema untuk data statistik yang ditampilkan di dashboard admin.
    """
    total_questions: int
    total_users: int
    recent_questions: List[QuestionRead]
    worst_questions: List['ItemAnalysisResultReadForStats'] # Gunakan forward reference jika perlu

    model_config = ConfigDict(from_attributes=True)


class TeacherDashboardStats(BaseModel):
    """
    Skema untuk data statistik yang ditampilkan di dashboard pengajar.
    """
    total_questions_created: int
    average_p_value: Optional[float] = None
    average_d_index: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class ItemAnalysisResultReadForStats(BaseModel):
    """
    Skema sederhana untuk menampilkan hasil analisis di dashboard.
    """
    id: UUID
    difficulty_index_p_value: Optional[float]
    discrimination_index: Optional[float]
    question: QuestionRead # Tampilkan detail soal terkait

    model_config = ConfigDict(from_attributes=True)

class StudentScoresInput(BaseModel):
    """
    Skema untuk menerima input skor total siswa.
    Formatnya adalah sebuah dictionary, di mana key adalah student_identifier
    dan value adalah skor total mereka.
    """
    scores: Dict[str, float]