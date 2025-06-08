# backend/app/api/v1/endpoints/responses.py
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from sqlalchemy.orm import Session
from typing import List, Any, Optional
from uuid import UUID

from app import schemas, crud
from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.services.bulk_upload_service import bulk_upload_service

router = APIRouter()

@router.post("/bulk", status_code=status.HTTP_200_OK, response_model=schemas.BulkUploadResponse)
async def create_student_responses_bulk(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    file: UploadFile = File(...)
) -> Any:
    """
    Mengunggah file CSV atau JSON untuk membuat banyak jawaban siswa sekaligus.
    """
    return bulk_upload_service.process_response_upload(db=db, file=file)

@router.get("/by-question/{question_id}", response_model=List[schemas.StudentResponseRead])
async def read_responses_by_question(
    question_id: UUID,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Mengambil semua respons siswa untuk satu soal tertentu.
    Memerlukan otorisasi jika data sensitif.
    """
    # Validasi apakah question_id ada
    question = crud.question.get(db=db, id=question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Question with id {question_id} not found.")

    responses = crud.student_response.get_multi_by_question(
        db=db, question_id=question_id, skip=skip, limit=limit
    )
    return responses

@router.get("/by-student/{student_identifier}", response_model=List[schemas.StudentResponseRead])
async def read_responses_by_student(
    student_identifier: str,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Mengambil semua respons dari satu siswa tertentu.
    Memerlukan otorisasi yang ketat karena ini bisa jadi data personal.
    """
    # Anda mungkin ingin menambahkan validasi apakah student_identifier ada,
    # atau otorisasi apakah current_user berhak melihat data siswa ini.
    # Untuk contoh ini, kita langsung panggil CRUD.
    responses = crud.student_response.get_multi_by_student(
        db=db, student_identifier=student_identifier, skip=skip, limit=limit
    )
    if not responses: # Bisa jadi siswa belum pernah submit atau identifier salah
        # Anda bisa mengembalikan list kosong atau 404 jika identifier dianggap harus selalu ada
        pass # Mengembalikan list kosong jika tidak ada respons
    return responses