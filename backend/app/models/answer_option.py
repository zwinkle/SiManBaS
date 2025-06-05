# backend/app/models/answer_option.py
import uuid
from sqlalchemy import Column, String, Text, Boolean, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class AnswerOption(Base):
    __tablename__ = "answer_options"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(PG_UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    option_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False, default=False)
    display_order = Column(Integer, nullable=True) # Untuk menentukan urutan pilihan jika diperlukan

    # Relasi dengan Question
    question = relationship("Question", back_populates="answer_options")

    # Relasi dengan StudentResponse (jika ada respons yang memilih opsi ini)
    chosen_by_responses = relationship("StudentResponse", back_populates="selected_option")


    def __repr__(self):
        return f"<AnswerOption(id={self.id}, question_id={self.question_id}, correct={self.is_correct})>"