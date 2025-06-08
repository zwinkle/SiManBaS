# backend/app/models/test_session.py

import uuid
from sqlalchemy import Column, String, Text, DateTime, func, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

# Association Table untuk relasi Many-to-Many antara TestSession dan Question
test_session_questions = Table(
    'test_session_questions',
    Base.metadata,
    Column('test_session_id', PG_UUID(as_uuid=True), ForeignKey('test_sessions.id', ondelete="CASCADE"), primary_key=True),
    Column('question_id', PG_UUID(as_uuid=True), ForeignKey('questions.id', ondelete="CASCADE"), primary_key=True)
)

class TestSession(Base):
    __tablename__ = "test_sessions"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    owner_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    owner = relationship("User")
    # Relasi Many-to-Many ke Question
    questions = relationship("Question", secondary=test_session_questions, back_populates="test_sessions", lazy="selectin")