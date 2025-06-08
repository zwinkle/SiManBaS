# backend/app/crud/crud_comment.py

from typing import List
from uuid import UUID
from sqlalchemy.orm import Session, selectinload

from app.crud.base import CRUDBase
from app.models.comment import Comment
from app.models.user import User # Untuk type hint owner
from app.schemas.comment import CommentCreate, CommentUpdate

class CRUDComment(CRUDBase[Comment, CommentCreate, CommentUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: CommentCreate, owner: User, question_id: UUID
    ) -> Comment:
        """Membuat komentar baru dengan pemilik dan ID soal."""
        db_obj = self.model(
            content=obj_in.content,
            owner_id=owner.id,
            question_id=question_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_question(
        self, db: Session, *, question_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Comment]:
        """Mengambil daftar komentar untuk soal tertentu, diurutkan dari yang terbaru."""
        return (
            db.query(self.model)
            .filter(self.model.question_id == question_id)
            .options(selectinload(self.model.owner)) # Eager load data pemilik
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

comment = CRUDComment(Comment)