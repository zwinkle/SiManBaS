# backend/app/crud/crud_answer_option.py
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.answer_option import AnswerOption
from app.schemas.answer_option import AnswerOptionCreate, AnswerOptionUpdate

class CRUDAnswerOption(CRUDBase[AnswerOption, AnswerOptionCreate, AnswerOptionUpdate]):
    def get_multi_by_question(
        self, db: Session, *, question_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[AnswerOption]:
        """Mengambil beberapa answer option berdasarkan question_id."""
        return (
            db.query(self.model)
            .filter(self.model.question_id == question_id)
            .order_by(self.model.display_order) # Urutkan berdasarkan display_order jika ada
            .offset(skip)
            .limit(limit)
            .all()
        )

answer_option = CRUDAnswerOption(AnswerOption)