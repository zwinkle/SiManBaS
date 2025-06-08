# backend/app/schemas/test_session.py

from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from uuid import UUID
from .question import QuestionRead # Untuk menampilkan soal di dalam sesi

class TestSessionBase(BaseModel):
    name: str
    description: Optional[str] = None

class TestSessionCreate(TestSessionBase):
    pass

class TestSessionUpdate(TestSessionBase):
    pass

class TestSessionRead(TestSessionBase):
    id: UUID
    owner_id: UUID
    questions: List[QuestionRead] = []

    model_config = ConfigDict(from_attributes=True)

class QuestionIDList(BaseModel):
    question_ids: List[UUID]