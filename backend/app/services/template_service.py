# backend/app/services/template_service.py

import io
import csv
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from uuid import UUID
from app import crud

class TemplateService:
    def generate_answer_sheet_template(self, db: Session, *, session_id: UUID) -> StreamingResponse:
        session = crud.test_session.get(db, id=session_id)
        if not session: return None

        output = io.StringIO()
        writer = csv.writer(output)
        
        headers = ["student_identifier", "question_id (jangan diubah)", "question_content (referensi)", "answer (diisi guru)"]
        writer.writerow(headers)

        if session.roster and session.roster.students:
            sorted_students = sorted(session.roster.students, key=lambda s: s.student_identifier)
            for student in sorted_students:
                for question in session.questions:
                    row = [student.student_identifier, question.id, question.content, ""]
                    writer.writerow(row)
        else:
            for question in session.questions:
                row = ["", question.id, question.content, ""]
                writer.writerow(row)
            
        output.seek(0)
        
        response = StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv"
        )
        response.headers["Content-Disposition"] = f"attachment; filename=template_jawaban_{session.name.replace(' ', '_')}.csv"
        return response
    
    def generate_roster_template(self) -> StreamingResponse:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["student_identifier"])
        writer.writerow(["ContohSiswa01"])
        writer.writerow(["ContohSiswa02"])
        output.seek(0)

        response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=template_daftar_siswa.csv"
        return response

template_service = TemplateService()