# backend/app/schemas/test_session.py

from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from uuid import UUID
from .question import QuestionRead

class TestSessionBase(BaseModel):
    name: str
    description: Optional[str] = None

class TestSessionCreate(TestSessionBase):
    roster_id: Optional[UUID] = None

class TestSessionUpdate(TestSessionBase):
    roster_id: Optional[UUID] = None

class TestSessionRead(TestSessionBase):
    id: UUID
    owner_id: UUID
    roster_id: Optional[UUID] = None
    questions: List[QuestionRead] = []

    model_config = ConfigDict(from_attributes=True)

class QuestionIDList(BaseModel):
    question_ids: List[UUID]