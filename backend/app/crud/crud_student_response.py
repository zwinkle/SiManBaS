# backend/app/crud/crud_student_response.py
from typing import List, Optional, Dict
from uuid import UUID
from sqlalchemy.orm import Session, selectinload

from fastapi.encoders import jsonable_encoder

from app.crud.base import CRUDBase
from app.models.student_response import StudentResponse
from app.models.question import Question # Impor Question untuk mendapatkan kunci jawaban
from app.schemas.student_response import StudentResponseCreate

class CRUDStudentResponse(CRUDBase[StudentResponse, StudentResponseCreate, StudentResponseCreate]):
    
    def create_bulk(self, db: Session, *, responses_in: List[StudentResponseCreate]) -> List[StudentResponse]:
        """
        Membuat beberapa student response sekaligus dengan auto-grading untuk pilihan ganda.
        """
        # 1. Ambil semua ID soal yang unik dari data input
        question_ids = {res.question_id for res in responses_in}
        
        # 2. Ambil semua soal tersebut dari DB dalam satu query untuk efisiensi
        questions_map: Dict[UUID, Question] = {
            q.id: q for q in db.query(Question).filter(Question.id.in_(question_ids)).all()
        }

        # 3. Buat peta kunci jawaban untuk akses cepat
        correct_options_map: Dict[UUID, Optional[UUID]] = {}
        for q_id, question in questions_map.items():
            correct_option_id = None
            if question.question_type == 'multiple_choice':
                for option in question.answer_options:
                    if option.is_correct:
                        correct_option_id = option.id
                        break
            correct_options_map[q_id] = correct_option_id

        # 4. Proses setiap respons
        db_responses = []
        for response_in in responses_in:
            question = questions_map.get(response_in.question_id)
            if not question:
                continue # Lewati jika soal tidak ditemukan

            response_data = response_in.model_dump()
            
            # --- Logika Auto-Grading ---
            is_correct = response_in.is_response_correct # Gunakan nilai dari input jika ada (untuk esai)
            if question.question_type == 'multiple_choice' and is_correct is None:
                # Jika tipe MC dan is_correct tidak diisi, tentukan secara otomatis
                correct_id = correct_options_map.get(question.id)
                is_correct = (response_in.selected_option_id == correct_id) if correct_id else False
            # ---------------------------

            # Update data dengan is_correct yang sudah ditentukan
            response_data['is_response_correct'] = is_correct

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
            .options(selectinload(self.model.question))
            .filter(self.model.student_identifier == student_identifier)
            .order_by(self.model.submitted_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

student_response = CRUDStudentResponse(StudentResponse)
