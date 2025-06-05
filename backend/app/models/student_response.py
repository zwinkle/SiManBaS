# backend/app/models/student_response.py
import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class StudentResponse(Base):
    __tablename__ = "student_responses"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(PG_UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    student_identifier = Column(String(100), nullable=False, index=True) # Bisa ID siswa anonim
    test_session_identifier = Column(String(100), nullable=True, index=True) # Untuk mengelompokkan respons dari sesi tes yang sama
    
    response_text = Column(Text, nullable=True) # Untuk jawaban esai/singkat
    selected_option_id = Column(PG_UUID(as_uuid=True), ForeignKey("answer_options.id"), nullable=True) # Untuk pilihan ganda
    
    is_response_correct = Column(Boolean, nullable=True) # Bisa diisi saat input atau dihitung saat analisis
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relasi dengan Question
    question = relationship("Question", back_populates="student_responses")

    # Relasi dengan AnswerOption (jika respons adalah pilihan ganda)
    selected_option = relationship("AnswerOption", back_populates="chosen_by_responses")

    def __repr__(self):
        return f"<StudentResponse(id={self.id}, question_id={self.question_id}, student='{self.student_identifier}')>"