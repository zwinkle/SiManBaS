# backend/app/api/v1/endpoints/analysis.py
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import Any, Optional, List, Dict
from uuid import UUID
from pydantic import BaseModel

from app import schemas
from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.services.item_analysis_service import ItemAnalysisService

router = APIRouter()

# Skema baru untuk input skor total jika dikirim via body
class StudentScoresInput(BaseModel):
    scores: Dict[str, float] # student_identifier: total_score

@router.post("/questions/{question_id}", response_model=schemas.ItemAnalysisResultRead)
async def trigger_and_get_question_analysis(
    question_id: UUID,
    db: Session = Depends(get_db),
    test_session_identifier: Optional[str] = None, # Bisa dari query param
    student_scores_input: Optional[StudentScoresInput] = None, # Data skor dari body, opsional
    item_analysis_service: ItemAnalysisService = Depends(ItemAnalysisService),
    # current_user: User = Depends(get_current_active_user) # Aktifkan jika perlu
) -> Any:
    """
    Memicu perhitungan analisis untuk soal tertentu dan menyimpan/memperbarui hasilnya.
    Secara opsional menerima skor total siswa untuk perhitungan Indeks Diskriminasi.
    """
    all_student_scores = student_scores_input.scores if student_scores_input else None

    try:
        analysis_result = item_analysis_service.get_or_create_analysis_for_question(
            db=db,
            question_id=question_id,
            test_session_identifier=test_session_identifier,
            all_student_total_scores_for_test=all_student_scores
        )
        return analysis_result
    except HTTPException as e:
        raise e
    except Exception as e:
        # logger.error(f"Unexpected error during analysis: {e}", exc_info=True) # Contoh logging
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred during analysis.")

# Endpoint GET tetap sama, hanya mengambil data yang sudah ada
@router.get("/questions/{question_id}", response_model=schemas.ItemAnalysisResultRead)
async def get_question_analysis(
    question_id: UUID,
    test_session_identifier: Optional[str] = None,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
) -> Any:
    from app import crud # Impor crud di sini untuk get_by_question_and_session
    analysis_result = crud.item_analysis_result.get_by_question_and_session(
        db=db, question_id=question_id, test_session_identifier=test_session_identifier
    )
    if not analysis_result:
        question = crud.question.get(db=db, id=question_id)
        if not question:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Question with id {question_id} not found.")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis result not found for this question/session. Trigger analysis first via POST.")
    return schemas.ItemAnalysisResultRead.model_validate(analysis_result)