# backend/app/services/bulk_upload_service.py

import csv
import json
import io
from typing import List, Dict, Any
from sqlalchemy.orm import Session, selectinload
from fastapi import UploadFile, HTTPException, status
from pydantic import ValidationError

from app import crud, schemas
from app.models.user import User
from app.models.question import Question
from app.models.roster import Roster

class BulkUploadService:
    def process_question_upload(
        self, db: Session, *, file: UploadFile, owner: User
    ) -> schemas.BulkUploadResponse:
        """
        Memproses file upload (CSV atau JSON) untuk membuat soal secara massal.
        """
        content = file.file.read().decode('utf-8')
        
        if file.content_type == 'application/json':
            try:
                rows = json.loads(content)
                if not isinstance(rows, list):
                    raise json.JSONDecodeError("JSON root must be an array of objects.", content, 0)
            except json.JSONDecodeError as e:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid JSON format: {e}")
        elif file.content_type == 'text/csv':
            rows = list(csv.DictReader(io.StringIO(content)))
        else:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Unsupported file type. Please upload a CSV or JSON file."
            )
        return self._process_question_rows(db, rows=rows, owner=owner)

    def _process_question_rows(
        self, db: Session, *, rows: iter, owner: User
    ) -> schemas.BulkUploadResponse:
        """
        Memvalidasi dan menyimpan baris data soal, dengan pencegahan duplikasi.
        """
        successfully_created = 0
        errors: List[schemas.UploadErrorDetail] = []
        
        existing_questions_content = {q.content for q in db.query(Question.content).all()}

        total_processed_count = 0
        for i, row in enumerate(rows, start=1):
            total_processed_count = i
            try:
                question_content = row.get('content')
                if not question_content:
                    raise ValueError("Kolom 'content' tidak boleh kosong.")
                
                if question_content in existing_questions_content:
                    errors.append(schemas.UploadErrorDetail(
                        row_number=i,
                        error_message="Soal sudah ada (konten sama persis). Dilewati.",
                        row_data=row
                    ))
                    continue

                if 'answer_options' in row and isinstance(row['answer_options'], str):
                    if row['answer_options']:
                        try:
                            row['answer_options'] = json.loads(row['answer_options'])
                        except json.JSONDecodeError:
                            raise ValueError("Kolom 'answer_options' harus berisi format JSON yang valid atau string kosong.")
                    else:
                        row['answer_options'] = []

                question_in = schemas.QuestionCreate(**row)
                crud.question.create_with_owner(db, obj_in=question_in, owner_id=owner.id)
                
                existing_questions_content.add(question_content)
                successfully_created += 1

            except (ValidationError, ValueError) as e:
                errors.append(schemas.UploadErrorDetail(row_number=i, error_message=str(e), row_data=row))
            except Exception as e:
                errors.append(schemas.UploadErrorDetail(row_number=i, error_message=f"Error tak terduga: {str(e)}", row_data=row))
        
        return schemas.BulkUploadResponse(
            total_processed=total_processed_count,
            successfully_created=successfully_created,
            errors=errors
        )
    
    def process_roster_upload(self, db: Session, *, roster: Roster, file: UploadFile) -> Roster:
        content = file.file.read().decode('utf-8')
        reader = csv.DictReader(io.StringIO(content))
        student_identifiers = {row['student_identifier'].strip() for row in reader if row.get('student_identifier')}
        
        if not student_identifiers:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File CSV tidak berisi data atau header 'student_identifier' tidak ditemukan.")
            
        return crud.roster.add_students_to_roster(db=db, roster=roster, student_identifiers=student_identifiers)
    
    def process_response_upload(self, db: Session, *, file: UploadFile) -> schemas.BulkUploadResponse:
        """
        Memproses file upload (CSV atau JSON) untuk membuat jawaban siswa secara massal.
        """
        content = file.file.read().decode('utf-8')
        
        if file.content_type == 'application/json':
            try:
                rows = json.loads(content)
                if not isinstance(rows, list): raise json.JSONDecodeError("JSON root must be an array of objects.", content, 0)
            except json.JSONDecodeError as e:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid JSON format: {e}")
        elif file.content_type == 'text/csv':
            rows = list(csv.DictReader(io.StringIO(content)))
        else:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Unsupported file type. Please upload a CSV or JSON file."
            )
        return self._process_response_rows(db, rows=rows)

    def _process_response_rows(self, db: Session, *, rows: List[Dict[str, Any]]) -> schemas.BulkUploadResponse:
        """
        Memvalidasi dan menyimpan baris data jawaban siswa dari file.
        Termasuk logika untuk mencocokkan teks jawaban dengan ID opsi.
        """
        successfully_created = 0
        errors: List[schemas.UploadErrorDetail] = []
        validated_responses: List[schemas.StudentResponseCreate] = []

        question_ids_from_file = {row.get('question_id (jangan diubah)') for row in rows if row.get('question_id (jangan diubah)')}
        questions_map = {
            str(q.id): q for q in db.query(Question).options(selectinload(Question.answer_options)).filter(Question.id.in_(question_ids_from_file)).all()
        }

        total_processed_count = 0
        for i, row in enumerate(rows, start=1):
            total_processed_count = i
            try:
                question_id_str = row.get('question_id (jangan diubah)')
                question = questions_map.get(question_id_str)
                if not question:
                    raise ValueError(f"Soal dengan ID '{question_id_str}' tidak ditemukan.")
                
                response_payload = {
                    "question_id": question_id_str,
                    "student_identifier": row.get('student_identifier'),
                    "response_text": None,
                    "selected_option_id": None,
                    "is_response_correct": None,
                    "test_session_identifier": row.get('test_session_identifier')
                }

                answer_text = row.get('answer (diisi oleh guru)', '').strip()

                if question.question_type == 'multiple_choice':
                    if answer_text:
                        matched_option = next((opt for opt in question.answer_options if opt.option_text.strip() == answer_text), None)
                        if matched_option:
                            response_payload['selected_option_id'] = matched_option.id
                elif question.question_type == 'short_answer':
                    response_payload['response_text'] = answer_text
                    if question.correct_answer_text:
                        if answer_text.lower() == question.correct_answer_text.lower():
                            response_payload['is_response_correct'] = True
                        else:
                            response_payload['is_response_correct'] = False
                else: # Essay
                    response_payload['response_text'] = answer_text
                
                validated_data = schemas.StudentResponseCreate(**response_payload)
                validated_responses.append(validated_data)

            except (ValidationError, ValueError, KeyError) as e:
                errors.append(schemas.UploadErrorDetail(row_number=i, error_message=str(e), row_data=row))
            except Exception as e:
                errors.append(schemas.UploadErrorDetail(row_number=i, error_message=f"Error tak terduga: {str(e)}", row_data=row))

        if validated_responses:
            created_objects = crud.student_response.create_bulk(db, responses_in=validated_responses)
            successfully_created = len(created_objects)
        
        return schemas.BulkUploadResponse(
            total_processed=total_processed_count,
            successfully_created=successfully_created,
            errors=errors
        )


bulk_upload_service = BulkUploadService()
