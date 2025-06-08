# backend/app/services/template_service.py

import io
import csv
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from app import crud

class TemplateService:
    def generate_answer_sheet_template(self, db: Session, *, session_id: str) -> StreamingResponse:
        session = crud.test_session.get(db, id=session_id)
        if not session:
            return None # Akan ditangani sebagai 404 di endpoint

        output = io.StringIO()
        writer = csv.writer(output)
        
        # Tulis header
        headers = ["student_identifier", "question_id (jangan diubah)", "question_content (referensi)", "answer (diisi oleh guru)", "is_correct (opsional, untuk esai)"]
        writer.writerow(headers)

        # Tulis baris untuk setiap soal dalam sesi
        for question in session.questions:
            row = ["", question.id, question.content, "", ""]
            writer.writerow(row)
            
        output.seek(0)
        
        response = StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv"
        )
        response.headers["Content-Disposition"] = f"attachment; filename=template_jawaban_{session.name.replace(' ', '_')}.csv"
        return response

template_service = TemplateService()