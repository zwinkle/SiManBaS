# backend/app/crud/crud_student_response.py
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from app.crud.base import CRUDBase
from app.models.student_response import StudentResponse
from app.schemas.student_response import StudentResponseCreate # Update schema tidak didefinisikan, pakai Create untuk base.

class CRUDStudentResponse(CRUDBase[StudentResponse, StudentResponseCreate, StudentResponseCreate]):
    # Metode create dari CRUDBase sudah cukup untuk kasus dasar.
    # Anda bisa override jika perlu logika khusus saat pembuatan StudentResponse.
    # Misalnya, jika is_response_correct perlu dihitung di sini berdasarkan selected_option_id.

    def create_bulk(self, db: Session, *, responses_in: List[StudentResponseCreate]) -> List[StudentResponse]:
        """Membuat beberapa student response sekaligus."""
        db_responses = []
        for response_in in responses_in:
            response_data = jsonable_encoder(response_in)
            db_obj = self.model(**response_data)
            db.add(db_obj)
            db_responses.append(db_obj)
        db.commit()
        for db_obj in db_responses: # Refresh setiap objek setelah commit
            db.refresh(db_obj)
        return db_responses

    def get_multi_by_question(
        self, db: Session, *, question_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[StudentResponse]:
        """Mengambil beberapa student response berdasarkan question_id."""
        return (
            db.query(self.model)
            .filter(self.model.question_id == question_id)
            .order_by(self.model.submitted_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_multi_by_student(
        self, db: Session, *, student_identifier: str, skip: int = 0, limit: int = 100
    ) -> List[StudentResponse]:
        """Mengambil beberapa student response berdasarkan student_identifier."""
        return (
            db.query(self.model)
            .filter(self.model.student_identifier == student_identifier)
            .order_by(self.model.submitted_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

student_response = CRUDStudentResponse(StudentResponse)