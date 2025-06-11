# backend/app/schemas/roster.py
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from uuid import UUID

# --- Skema untuk Siswa ---
class StudentBase(BaseModel):
    student_identifier: str

class StudentCreate(StudentBase):
    pass

class StudentRead(StudentBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

# --- Skema untuk Kelas/Roster ---
class RosterBase(BaseModel):
    name: str
    description: Optional[str] = None

class RosterCreate(RosterBase):
    pass

class RosterUpdate(RosterBase):
    pass

class RosterRead(RosterBase):
    id: UUID
    owner_id: UUID
    students: List[StudentRead] = []
    model_config = ConfigDict(from_attributes=True)