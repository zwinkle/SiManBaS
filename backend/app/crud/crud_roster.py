# backend/app/crud/crud_roster.py
from sqlalchemy.orm import Session
from typing import List, Set
from uuid import UUID
from app.crud.base import CRUDBase
from app.models.roster import Roster, Student
from app.schemas.roster import RosterCreate, RosterUpdate

class CRUDRoster(CRUDBase[Roster, RosterCreate, RosterUpdate]):
    def create_with_owner(self, db: Session, *, obj_in: RosterCreate, owner_id: UUID) -> Roster:
        db_obj = self.model(**obj_in.model_dump(), owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
        
    def add_students_to_roster(self, db: Session, *, roster: Roster, student_identifiers: Set[str]) -> Roster:
        existing_students = {s.student_identifier for s in roster.students}
        new_students = student_identifiers - existing_students
        
        for identifier in new_students:
            if identifier: # Pastikan tidak menambah string kosong
                db_student = Student(student_identifier=identifier, roster_id=roster.id)
                db.add(db_student)
            
        db.commit()
        db.refresh(roster)
        return roster

roster = CRUDRoster(Roster)