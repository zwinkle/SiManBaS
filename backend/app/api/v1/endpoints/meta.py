# backend/app/api/v1/endpoints/meta.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import crud
from app.db.session import get_db

router = APIRouter()

@router.get("/subjects", response_model=List[str], summary="Dapatkan Daftar Unik Mata Pelajaran")
def read_subjects(db: Session = Depends(get_db)):
    """
    Mengambil daftar semua mata pelajaran unik yang ada di bank soal.
    """
    return crud.meta.get_unique_subjects(db=db)

@router.get("/topics", response_model=List[str], summary="Dapatkan Daftar Unik Topik berdasarkan Mata Pelajaran")
def read_topics(subject: str, db: Session = Depends(get_db)):
    """
    Mengambil daftar semua topik unik untuk mata pelajaran yang ditentukan.
    """
    return crud.meta.get_unique_topics_by_subject(db=db, subject=subject)