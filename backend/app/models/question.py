# backend/app/models/question.py
import uuid
from sqlalchemy import Column, String, Text, DateTime, func, ForeignKey, ARRAY, Table
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

from .test_session import test_session_questions

class Question(Base):
    __tablename__ = "questions"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_by_user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False) # contoh: 'multiple_choice', 'essay'
    subject = Column(String(100), nullable=True, index=True)
    topic = Column(String(100), nullable=True, index=True)
    initial_difficulty_estimate = Column(String(20), nullable=True) # contoh: 'easy', 'medium', 'hard'
    tags = Column(ARRAY(String), nullable=True)
    correct_answer_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relasi dengan User (pembuat soal)
    creator = relationship("User", back_populates="questions_created")

    # Relasi dengan AnswerOption (jika soal pilihan ganda)
    answer_options = relationship("AnswerOption", back_populates="question", cascade="all, delete-orphan", lazy="selectin")

    # Relasi dengan StudentResponse
    student_responses = relationship("StudentResponse", back_populates="question", cascade="all, delete-orphan")

    # Relasi dengan ItemAnalysisResult
    analysis_results = relationship("ItemAnalysisResult", back_populates="question", cascade="all, delete-orphan")

    comments = relationship("Comment", back_populates="question", cascade="all, delete-orphan")

    test_sessions = relationship("TestSession", secondary=test_session_questions, back_populates="questions")

    def __repr__(self):
        return f"<Question(id={self.id}, type='{self.question_type}', subject='{self.subject}')>"