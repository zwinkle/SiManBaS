# backend/app/models/comment.py

import uuid
from sqlalchemy import Column, Text, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Comment(Base):
    __tablename__ = "comments"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    
    question_id = Column(PG_UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    owner_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relasi dengan Pengguna (pemilik komentar)
    owner = relationship("User", back_populates="comments")
    # Relasi dengan Soal
    question = relationship("Question", back_populates="comments")

    def __repr__(self):
        return f"<Comment(id={self.id}, owner_id={self.owner_id})>"