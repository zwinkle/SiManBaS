# backend/app/crud/crud_question.py
from typing import List, Optional, Any, Union, Dict
from uuid import UUID

from sqlalchemy.orm import Session, selectinload
from fastapi.encoders import jsonable_encoder

from app.crud.base import CRUDBase
from app.models.question import Question
from app.models.answer_option import AnswerOption # Untuk membuat answer option
from app.schemas.question import QuestionCreate, QuestionUpdate
from app.schemas.answer_option import AnswerOptionCreate # Untuk data answer option dari skema

class CRUDQuestion(CRUDBase[Question, QuestionCreate, QuestionUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: QuestionCreate, owner_id: UUID
    ) -> Question:
        """
        Membuat soal baru dengan ID pemilik (pembuat soal).
        Juga menangani pembuatan answer_options jika ada.
        """
        obj_in_data = jsonable_encoder(obj_in, exclude={"answer_options"}) # Exclude answer_options untuk diproses manual
        db_obj = self.model(**obj_in_data, created_by_user_id=owner_id)
        
        if obj_in.answer_options:
            for option_in in obj_in.answer_options:
                db_option = AnswerOption(**option_in.model_dump(), question_id=db_obj.id) # Set question_id nanti setelah db_obj punya ID
                db_obj.answer_options.append(db_option)
        
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

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100,
        subject: Optional[str] = None,
        topic: Optional[str] = None,
        question_type: Optional[str] = None
        # Tambahkan filter lain jika perlu
    ) -> List[Question]:
        """Mengambil beberapa soal dengan paginasi dan filter, termasuk eager loading."""
        query = db.query(self.model).options(
            selectinload(self.model.creator),
            selectinload(self.model.answer_options)
        )
        if subject:
            query = query.filter(self.model.subject.ilike(f"%{subject}%")) # Case-insensitive like
        if topic:
            query = query.filter(self.model.topic.ilike(f"%{topic}%"))
        if question_type:
            query = query.filter(self.model.question_type == question_type)
            
        return query.order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()

    def get_multi_by_owner(
        self, db: Session, *, owner_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Question]:
        """Mengambil beberapa soal milik owner tertentu."""
        return (
            db.query(self.model)
            .filter(self.model.created_by_user_id == owner_id)
            .options(
                selectinload(self.model.creator), 
                selectinload(self.model.answer_options)
            )
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update(
        self,
        db: Session,
        *,
        db_obj: Question, # Objek Question yang ada dari database
        obj_in: Union[QuestionUpdate, Dict[str, Any]] # Data update dari request
    ) -> Question:
        """
        Memperbarui soal.
        Termasuk logika untuk menghapus answer_options lama dan membuat yang baru jika ada di obj_in.
        """
        obj_data = jsonable_encoder(db_obj) # Data lama dari objek DB

        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        # Update field-field dasar dari Question
        for field in obj_data:
            if field in update_data and field != "answer_options": # Jangan proses answer_options di sini
                setattr(db_obj, field, update_data[field])

        # Tangani pembaruan answer_options jika ada di data input
        if "answer_options" in update_data and update_data["answer_options"] is not None:
            # 1. Hapus semua answer_options lama yang terkait dengan soal ini
            db.query(AnswerOption).filter(AnswerOption.question_id == db_obj.id).delete(synchronize_session=False)
            # synchronize_session=False digunakan karena kita akan menambah objek baru di sesi yang sama.
            # Atau bisa juga:
            # for old_option in list(db_obj.answer_options): # Buat list copy untuk iterasi
            #     db.delete(old_option)
            # db.flush() # Flush untuk menghapus sebelum menambah yang baru

            # 2. Buat answer_options baru dari data input
            new_options = []
            for option_in_data in update_data["answer_options"]:
                # Asumsikan option_in_data adalah dict atau Pydantic model (AnswerOptionCreate)
                # Jika option_in_data adalah Pydantic model:
                # option_data = option_in_data.model_dump()
                # Jika sudah dict:
                option_data = option_in_data if isinstance(option_in_data, dict) else option_in_data.model_dump()

                new_option_obj = AnswerOption(**option_data, question_id=db_obj.id)
                new_options.append(new_option_obj)
            db_obj.answer_options = new_options # Ganti dengan list baru, SQLAlchemy akan menangani sisanya

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        # Muat ulang relasi answer_options agar konsisten setelah refresh
        db.refresh(db_obj, attribute_names=['answer_options'])
        return db_obj

question = CRUDQuestion(Question)