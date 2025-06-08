# backend/app/crud/crud_test_session.py

from typing import List
from uuid import UUID
from sqlalchemy.orm import Session, selectinload

from app.crud.base import CRUDBase
from app.models.test_session import TestSession
from app.models.question import Question
from app.schemas.test_session import TestSessionCreate, TestSessionUpdate

class CRUDTestSession(CRUDBase[TestSession, TestSessionCreate, TestSessionUpdate]):
    def create_with_owner(self, db: Session, *, obj_in: TestSessionCreate, owner_id: UUID) -> TestSession:
        db_obj = self.model(**obj_in.model_dump(), owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_owner(self, db: Session, *, owner_id: UUID, skip: int = 0, limit: int = 100) -> List[TestSession]:
        """
        Mengambil beberapa sesi ujian milik owner tertentu dengan eager loading.
        """
        return (
            db.query(self.model)
            .options(
                # Secara eksplisit muat relasi 'questions', dan untuk setiap question,
                # muat juga relasi 'creator'-nya. Ini mencegah N+1 query dan error serialisasi.
                selectinload(self.model.questions).selectinload(Question.creator)
            )
            .filter(self.model.owner_id == owner_id)
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def add_questions_to_session(self, db: Session, *, db_obj: TestSession, question_ids: List[UUID]) -> TestSession:
        questions = db.query(Question).filter(Question.id.in_(question_ids)).all()
        for question in questions:
            if question not in db_obj.questions:
                db_obj.questions.append(question)
        db.commit()
        db.refresh(db_obj)
        return db_obj

test_session = CRUDTestSession(TestSession)