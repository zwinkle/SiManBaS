# src/api/v1/endpoints/questions.py
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from uuid import UUID

from app import schemas, crud
from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.services.bulk_upload_service import bulk_upload_service
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

@router.get("/", response_model=schemas.QuestionPage) # 1. Gunakan skema QuestionPage
def read_questions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10, # Ubah default limit ke 10 agar sesuai dengan frontend
    subject: Optional[str] = None,
    topic: Optional[str] = None,
    question_type: Optional[str] = None,
) -> Any:
    """
    Mengambil daftar soal dengan filter dan paginasi.
    """
    # 2. Panggil fungsi CRUD yang mengembalikan dict berisi 'items' dan 'total'
    questions_data = crud.question.get_multi(
        db, skip=skip, limit=limit, subject=subject, topic=topic, question_type=question_type
    )
    return questions_data # 3. Kembalikan langsung objek dict tersebut

@router.get("/{question_id}/option-stats", response_model=schemas.QuestionOptionStatsRead)
def read_question_option_stats(
    question_id: UUID,
    db: Session = Depends(get_db),
    item_analysis_service: ItemAnalysisService = Depends(ItemAnalysisService),
):
    return item_analysis_service.get_question_option_statistics(db=db, question_id=question_id)

@router.post("/{question_id}/comments", response_model=schemas.CommentRead, status_code=status.HTTP_201_CREATED, summary="Tambah Komentar Baru pada Soal")
def create_comment_for_question(
    question_id: UUID,
    comment_in: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Menambahkan komentar atau umpan balik baru ke soal tertentu.
    Hanya pengguna yang sudah login yang bisa berkomentar.
    """
    # Pastikan soalnya ada
    question = crud.question.get(db=db, id=question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    comment = crud.comment.create_with_owner(
        db=db, obj_in=comment_in, owner=current_user, question_id=question_id
    )
    return comment

@router.get("/{question_id}/comments", response_model=List[schemas.CommentRead], summary="Dapatkan Semua Komentar untuk Soal")
def read_comments_for_question(
    question_id: UUID,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Mengambil daftar semua komentar/umpan balik untuk soal tertentu.
    """
    # Pastikan soalnya ada
    question = crud.question.get(db=db, id=question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
        
    comments = crud.comment.get_multi_by_question(
        db=db, question_id=question_id, skip=skip, limit=limit
    )
    return comments

@router.get("/{question_id}", response_model=schemas.QuestionRead)
async def read_question(
    question_id: UUID,
    db: Session = Depends(get_db),
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
    question_in: schemas.QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Memperbarui soal yang ada. Pengguna hanya bisa memperbarui soal miliknya.
    """
    db_question = crud.question.get(db=db, id=question_id)
    if not db_question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    if db_question.created_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    
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
    db_question = crud.question.get(db=db, id=question_id)
    if not db_question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    if db_question.created_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    
    crud.question.remove(db=db, id=question_id)

@router.post("/bulk-upload", response_model=schemas.BulkUploadResponse, status_code=status.HTTP_200_OK, summary="Upload Soal Secara Massal dari File CSV atau JSON")
def upload_questions_bulk(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    file: UploadFile = File(...)
):
    """
    Mengunggah file CSV atau JSON untuk membuat banyak soal sekaligus.
    
    Format CSV harus memiliki header: `content`, `question_type`, `subject`, `topic`, `answer_options` (sebagai JSON string).
    Contoh `answer_options` di CSV: `"[{\\"option_text\\":\\"A\\",\\"is_correct\\":true},{\\"option_text\\":\\"B\\",\\"is_correct\\":false}]"`

    Format JSON harus berupa array dari objek soal.
    """
    return bulk_upload_service.process_question_upload(db=db, file=file, owner=current_user)