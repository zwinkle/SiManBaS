# backend/app/services/bulk_upload_service.py

import csv
import json
import io
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, status
from pydantic import ValidationError

from app import crud, schemas
from app.models.user import User

class BulkUploadService:
    def process_question_upload(
        self, db: Session, *, file: UploadFile, owner: User
    ) -> schemas.BulkUploadResponse:
        """
        Memproses file upload (CSV atau JSON) untuk membuat soal secara massal.
        """
        if file.content_type == 'text/csv':
            return self._process_csv(db, file=file, owner=owner)
        elif file.content_type == 'application/json':
            return self._process_json(db, file=file, owner=owner)
        else:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Unsupported file type. Please upload a CSV or JSON file."
            )

    def _process_csv(
        self, db: Session, *, file: UploadFile, owner: User
    ) -> schemas.BulkUploadResponse:
        content = file.file.read().decode('utf-8')
        reader = csv.DictReader(io.StringIO(content))
        return self._process_rows(db, rows=reader, owner=owner)

    def _process_json(
        self, db: Session, *, file: UploadFile, owner: User
    ) -> schemas.BulkUploadResponse:
        try:
            content = file.file.read().decode('utf-8')
            rows = json.loads(content)
            if not isinstance(rows, list):
                raise json.JSONDecodeError("JSON root must be an array of objects.", content, 0)
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid JSON format: {e}"
            )
        return self._process_rows(db, rows=rows, owner=owner)

    def _process_rows(
        self, db: Session, *, rows: iter, owner: User
    ) -> schemas.BulkUploadResponse:
        successfully_created = 0
        errors: List[schemas.UploadErrorDetail] = []

        for i, row in enumerate(rows, start=1):
            try:
                # Membersihkan data dari CSV (semua value adalah string)
                # Untuk answer_options, kita asumsikan formatnya adalah JSON string di dalam sel CSV
                if 'answer_options' in row and isinstance(row['answer_options'], str):
                    try:
                        row['answer_options'] = json.loads(row['answer_options'])
                    except json.JSONDecodeError:
                        raise ValueError("Kolom 'answer_options' harus berisi format JSON yang valid.")
                
                # Validasi data menggunakan Pydantic schema
                question_in = schemas.QuestionCreate(**row)
                
                # Jika valid, buat soal
                crud.question.create_with_owner(db, obj_in=question_in, owner_id=owner.id)
                successfully_created += 1

            except (ValidationError, ValueError) as e:
                errors.append(schemas.UploadErrorDetail(
                    row_number=i,
                    error_message=str(e),
                    row_data=row
                ))
            except Exception as e:
                # Menangkap error tak terduga lainnya
                errors.append(schemas.UploadErrorDetail(
                    row_number=i,
                    error_message=f"An unexpected error occurred: {str(e)}",
                    row_data=row
                ))
        
        return schemas.BulkUploadResponse(
            total_processed=i,
            successfully_created=successfully_created,
            errors=errors
        )

bulk_upload_service = BulkUploadService()
