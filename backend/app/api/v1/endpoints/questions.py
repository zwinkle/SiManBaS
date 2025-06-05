# backend/app/api/v1/endpoints/questions.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from uuid import UUID

from app import schemas, crud # <--- IMPORT crud
from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models.user import User # Untuk dependensi current_user
from app.services.item_analysis_service import ItemAnalysisService

router = APIRouter()

@router.post("/", response_model=schemas.QuestionRead, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_in: schemas.QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Membuat soal baru. Hanya pengguna terautentikasi yang bisa membuat soal.
    """
    return crud.question.create_with_owner(db=db, obj_in=question_in, owner_id=current_user.id)

@router.get("/", response_model=List[schemas.QuestionRead])
async def read_questions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    subject: Optional[str] = None,
    topic: Optional[str] = None,
    question_type: Optional[str] = None,
    # current_user: User = Depends(get_current_active_user) # Aktifkan jika list soal perlu autentikasi
) -> Any:
    """
    Mengambil daftar soal dengan filter dan paginasi.
    """
    # Modifikasi crud.question.get_multi untuk menerima filter ini jika diperlukan
    questions = crud.question.get_multi(
        db, skip=skip, limit=limit, subject=subject, topic=topic, question_type=question_type
    )
    return questions

@router.get("/{question_id}", response_model=schemas.QuestionRead)
async def read_question(
    question_id: UUID,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user) # Aktifkan jika perlu autentikasi
) -> Any:
    """
    Mengambil detail satu soal berdasarkan ID.
    """
    db_question = crud.question.get(db=db, id=question_id)
    if not db_question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return db_question

@router.put("/{question_id}", response_model=schemas.QuestionRead)
async def update_question(
    question_id: UUID,
    question_in: schemas.QuestionUpdate, # Menggunakan QuestionUpdate
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Memperbarui soal yang ada. Pengguna hanya bisa memperbarui soal miliknya.
    """
    db_question = crud.question.get(db=db, id=question_id) # Ambil soal yang ada
    if not db_question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    if db_question.created_by_user_id != current_user.id and current_user.role != "admin": # Contoh otorisasi, admin bisa edit semua
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions to update this question")
    
    updated_question = crud.question.update(db=db, db_obj=db_question, obj_in=question_in)
    return updated_question

@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> None:
    """
    Menghapus soal. Pengguna hanya bisa menghapus soal miliknya.
    """
    db_question = crud.question.get(db=db, id=question_id) # Ambil soal yang ada
    if not db_question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    if db_question.created_by_user_id != current_user.id and current_user.role != "admin": # Contoh otorisasi
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions to delete this question")
    
    crud.question.remove(db=db, id=question_id)
    # Tidak ada return body untuk status 204

@router.get(
    "/{question_id}/option-stats",
    response_model=schemas.QuestionOptionStatsRead, # Menggunakan skema dari schemas.statistics
    summary="Get Option Selection Statistics for a Multiple-Choice Question" # Deskripsi untuk Swagger UI
)
async def read_question_option_stats(
    question_id: UUID,
    db: Session = Depends(get_db),
    # Kita bisa membuat instance service atau menginjectnya jika service lebih kompleks
    # Untuk konsistensi dengan endpoint analysis, mari kita inject ItemAnalysisService
    item_analysis_service: ItemAnalysisService = Depends(ItemAnalysisService),
    # current_user: User = Depends(get_current_active_user) # Tambahkan jika perlu otorisasi
) -> Any:
    """
    Mengambil statistik pemilihan untuk setiap opsi jawaban dari sebuah soal pilihan ganda.
    Ini menunjukkan berapa banyak dan persentase siswa yang memilih setiap opsi.
    """
    try:
        # Panggil metode service yang baru dibuat
        stats = item_analysis_service.get_question_option_statistics(db=db, question_id=question_id)
        return stats
    except HTTPException as e:
        raise e # Biarkan HTTPException dari service muncul
    except Exception as e:
        # Anda mungkin ingin menambahkan logging di sini untuk error tak terduga
        # logger.error(f"Error calculating option stats for question {question_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An internal error occurred while retrieving option statistics.")