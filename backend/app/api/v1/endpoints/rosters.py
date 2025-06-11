# backend/app/api/v1/endpoints/rosters.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app import schemas, crud
from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.services.template_service import template_service
from app.services.bulk_upload_service import bulk_upload_service

router = APIRouter()

@router.post("/", response_model=schemas.RosterRead, status_code=status.HTTP_201_CREATED)
def create_roster(roster_in: schemas.RosterCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return crud.roster.create_with_owner(db=db, obj_in=roster_in, owner_id=current_user.id)

@router.get("/", response_model=List[schemas.RosterRead])
def read_rosters_for_owner(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return crud.roster.get_multi(db=db, owner_id=current_user.id) # Ganti ini dengan get_multi_by_owner jika ada

@router.get("/{roster_id}", response_model=schemas.RosterRead)
def read_roster(roster_id: UUID, db: Session = Depends(get_db)):
    db_roster = crud.roster.get(db=db, id=roster_id)
    if not db_roster: raise HTTPException(404, "Roster not found")
    return db_roster

@router.get("/templates/students", summary="Unduh Template Daftar Siswa")
def download_roster_template():
    return template_service.generate_roster_template()

@router.post("/{roster_id}/students/upload", response_model=schemas.RosterRead, summary="Upload Daftar Siswa ke Kelas")
def upload_student_list(roster_id: UUID, db: Session = Depends(get_db), file: UploadFile = File(...)):
    db_roster = crud.roster.get(db, id=roster_id)
    if not db_roster: raise HTTPException(404, "Roster not found")
    try:
        updated_roster = bulk_upload_service.process_roster_upload(db=db, roster=db_roster, file=file)
        return updated_roster
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))