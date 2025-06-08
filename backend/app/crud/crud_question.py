# backend/app/crud/crud_question.py
from typing import List, Optional, Any, Union, Dict
from uuid import UUID

from sqlalchemy.orm import Session, selectinload
from fastapi.encoders import jsonable_encoder

from app.crud.base import CRUDBase
from app.models.question import Question
from app.models.answer_option import AnswerOption
from app.schemas.question import QuestionCreate, QuestionUpdate
# AnswerOptionCreate tidak lagi dipakai di sini, bisa dihapus jika tidak ada referensi lain
# from app.schemas.answer_option import AnswerOptionCreate

class CRUDQuestion(CRUDBase[Question, QuestionCreate, QuestionUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: QuestionCreate, owner_id: UUID
    ) -> Question:
        """
        Membuat soal baru dengan ID pemilik (pembuat soal).
        Juga menangani pembuatan answer_options jika ada.
        """
        obj_in_data = jsonable_encoder(obj_in, exclude={"answer_options"})
        db_obj = self.model(**obj_in_data, created_by_user_id=owner_id)
        
        if obj_in.answer_options:
            for option_in in obj_in.answer_options:
                db_option = AnswerOption(**option_in.model_dump(), question=db_obj)
                db.add(db_option)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get(self, db: Session, id: UUID) -> Optional[Question]:
        """Mengambil satu soal berdasarkan ID dengan eager loading untuk relasi."""
        return (
            db.query(self.model)
            .options(
                selectinload(self.model.creator), 
                selectinload(self.model.answer_options)
            )
            .filter(self.model.id == id)
            .first()
        )

    # --- METODE INI DIMODIFIKASI ---
    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100,
        subject: Optional[str] = None,
        topic: Optional[str] = None,
        question_type: Optional[str] = None
    ) -> Dict[str, Any]: # Mengembalikan Dict, bukan List
        """Mengambil beberapa soal dengan paginasi dan filter, mengembalikan items dan total."""
        query = db.query(self.model).options(
            selectinload(self.model.creator),
            selectinload(self.model.answer_options)
        )
        if subject:
            query = query.filter(self.model.subject.ilike(f"%{subject}%"))
        if topic:
            query = query.filter(self.model.topic.ilike(f"%{topic}%"))
        if question_type:
            query = query.filter(self.model.question_type == question_type)
        
        total = query.count() # Hitung total item yang cocok dengan filter
        items = query.order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()
        
        return {"items": items, "total": total} # Kembalikan dalam format yang baru

    # get_multi_by_owner juga bisa dimodifikasi dengan cara yang sama jika diperlukan
    def get_multi_by_owner(
        self, db: Session, *, owner_id: UUID, skip: int = 0, limit: int = 100
    ) -> Dict[str, Any]:
        """Mengambil beberapa soal milik owner tertentu dengan paginasi."""
        query = (
            db.query(self.model)
            .filter(self.model.created_by_user_id == owner_id)
            .options(
                selectinload(self.model.creator), 
                selectinload(self.model.answer_options)
            )
        )
        total = query.count()
        items = query.order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()
        return {"items": items, "total": total}

    def update(
        self,
        db: Session,
        *,
        db_obj: Question,
        obj_in: Union[QuestionUpdate, Dict[str, Any]]
    ) -> Question:
        """
        Memperbarui soal, termasuk logika untuk menghapus dan membuat ulang answer_options.
        """
        obj_data = jsonable_encoder(db_obj)

        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        for field in obj_data:
            if field in update_data and field != "answer_options":
                setattr(db_obj, field, update_data[field])

        if "answer_options" in update_data and update_data["answer_options"] is not None:
            # Hapus semua answer_options lama
            db.query(AnswerOption).filter(AnswerOption.question_id == db_obj.id).delete(synchronize_session=False)
            
            # Buat answer_options baru
            new_options = []
            for option_in_data in update_data["answer_options"]:
                option_data = option_in_data if isinstance(option_in_data, dict) else option_in_data.model_dump()
                new_option_obj = AnswerOption(**option_data)
                new_options.append(new_option_obj)
            db_obj.answer_options = new_options

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        db.refresh(db_obj, attribute_names=['answer_options', 'creator'])
        return db_obj

question = CRUDQuestion(Question)
