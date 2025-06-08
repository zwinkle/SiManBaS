# backend/app/api/v1/endpoints/test_sessions.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from uuid import UUID
from fastapi.responses import StreamingResponse

from app import schemas, crud
from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.services.template_service import template_service

router = APIRouter()

@router.post("/", response_model=schemas.TestSessionRead, status_code=status.HTTP_201_CREATED)
def create_test_session(session_in: schemas.TestSessionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return crud.test_session.create_with_owner(db=db, obj_in=session_in, owner_id=current_user.id)

@router.get("/", response_model=List[schemas.TestSessionRead])
def read_test_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user), skip: int = 0, limit: int = 100):
    return crud.test_session.get_multi_by_owner(db=db, owner_id=current_user.id, skip=skip, limit=limit)

@router.get("/{session_id}", response_model=schemas.TestSessionRead)
def read_test_session(session_id: UUID, db: Session = Depends(get_db)):
    db_session = crud.test_session.get(db=db, id=session_id)
    if not db_session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test Session not found")
    return db_session

@router.put("/{session_id}", response_model=schemas.TestSessionRead)
def update_test_session(
    session_id: UUID,
    session_in: schemas.TestSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Memperbarui nama atau deskripsi sesi ujian.
    """
    db_session = crud.test_session.get(db=db, id=session_id)
    if not db_session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesi ujian tidak ditemukan")
    if db_session.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tidak memiliki izin untuk mengubah sesi ini")
    
    updated_session = crud.test_session.update(db=db, db_obj=db_session, obj_in=session_in)
    return updated_session

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Menghapus sesi ujian.
    """
    db_session = crud.test_session.get(db=db, id=session_id)
    if not db_session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesi ujian tidak ditemukan")
    if db_session.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tidak memiliki izin untuk menghapus sesi ini")

    crud.test_session.remove(db=db, id=session_id)

@router.post("/{session_id}/questions", response_model=schemas.TestSessionRead)
def add_questions_to_test_session(session_id: UUID, questions_in: schemas.QuestionIDList, db: Session = Depends(get_db)):
    db_session = crud.test_session.get(db=db, id=session_id)
    if not db_session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test Session not found")
    return crud.test_session.add_questions_to_session(db=db, db_obj=db_session, question_ids=questions_in.question_ids)

@router.get("/{session_id}/answer-sheet-template", response_class=StreamingResponse)
def download_answer_sheet_template(session_id: UUID, db: Session = Depends(get_db)):
    response = template_service.generate_answer_sheet_template(db=db, session_id=session_id)
    if not response:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test Session not found")
    return response