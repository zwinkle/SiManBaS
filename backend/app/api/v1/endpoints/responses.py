# backend/app/api/v1/endpoints/responses.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any, Optional # Tambahkan Optional
from uuid import UUID # Tambahkan UUID

from app import schemas, crud
from app.db.session import get_db
from app.core.security import get_current_active_user # Jika hanya user terautentikasi yang bisa submit/view
from app.models.user import User # Untuk dependensi current_user

router = APIRouter()

@router.post("/bulk", status_code=status.HTTP_201_CREATED, response_model=dict)
async def create_student_responses_bulk(
    responses_in: List[schemas.StudentResponseCreate],
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user) # Aktifkan jika perlu
) -> Any:
    """
    Mengirimkan batch respons siswa.
    """
    if not responses_in:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No responses provided.")
    
    question_ids = {res.question_id for res in responses_in}
    for q_id in question_ids:
        if not crud.question.get(db, id=q_id): # Verifikasi question exist
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Question with id {q_id} not found.")

    created_responses = crud.student_response.create_bulk(db=db, responses_in=responses_in)
    
    return {"message": f"{len(created_responses)} responses processed and created successfully."}

# --- ENDPOINT BARU DIIMPLEMENTASIKAN DI BAWAH INI ---

@router.get("/by-question/{question_id}", response_model=List[schemas.StudentResponseRead])
async def read_responses_by_question(
    question_id: UUID,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    # current_user: User = Depends(get_current_active_user) # Aktifkan jika perlu otorisasi
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
    # current_user: User = Depends(get_current_active_user) # Aktifkan jika perlu otorisasi
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