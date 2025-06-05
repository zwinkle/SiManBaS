# backend/app/models/item_analysis_result.py
import uuid
from sqlalchemy import Column, String, Integer, DateTime, func, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class ItemAnalysisResult(Base):
    __tablename__ = "item_analysis_results"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(PG_UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    test_session_identifier = Column(String(100), nullable=True, index=True) # Jika analisis dilakukan per sesi tes
    
    difficulty_index_p_value = Column(Numeric(5, 4), nullable=True) # Presisi 5 digit, 4 di belakang koma
    discrimination_index = Column(Numeric(5, 4), nullable=True)
    responses_analyzed_count = Column(Integer, nullable=True)
    
    last_analyzed_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relasi dengan Question
    question = relationship("Question", back_populates="analysis_results")

    # Constraint untuk memastikan kombinasi question_id dan test_session_identifier unik
    # Jika test_session_identifier adalah NULL, constraint ini mungkin perlu penanganan khusus di level DB
    # atau logika aplikasi. Untuk PostgreSQL, NULL tidak dianggap sama dengan NULL lain dalam unique constraint.
    # Jadi, beberapa entri dengan test_session_identifier NULL untuk question_id yang sama bisa saja terjadi.
    # Jika Anda ingin hanya satu hasil analisis per soal jika sesi tidak ditentukan,
    # maka test_session_identifier harus memiliki nilai default (misal string kosong) atau logika aplikasi yang menangani ini.
    __table_args__ = (UniqueConstraint('question_id', 'test_session_identifier', name='uq_question_session_analysis'),)


    def __repr__(self):
        return f"<ItemAnalysisResult(id={self.id}, question_id={self.question_id}, p_value={self.difficulty_index_p_value})>"