import uuid
from sqlalchemy import Column, String, Text, DateTime, func, ForeignKey, Table, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Roster(Base):
    """Model untuk Daftar Kelas."""
    __tablename__ = "rosters"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    owner_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    owner = relationship("User")
    students = relationship("Student", back_populates="roster", cascade="all, delete-orphan", lazy="selectin")
    test_sessions = relationship("TestSession", back_populates="roster")

class Student(Base):
    """Model untuk Siswa dalam sebuah Daftar Kelas."""
    __tablename__ = "students"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_identifier = Column(String(100), nullable=False, index=True)
    roster_id = Column(PG_UUID(as_uuid=True), ForeignKey("rosters.id", ondelete="CASCADE"), nullable=False, index=True)

    roster = relationship("Roster", back_populates="students")
    __table_args__ = (UniqueConstraint('roster_id', 'student_identifier', name='_roster_student_uc'),)