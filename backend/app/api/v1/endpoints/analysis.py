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
    # Gunakan Body(...) untuk menerima JSON body, termasuk yang opsional
    student_scores_input: Optional[schemas.StudentScoresInput] = Body(None),
    item_analysis_service: ItemAnalysisService = Depends(ItemAnalysisService),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Memicu perhitungan analisis untuk soal tertentu.
    Secara opsional menerima skor total siswa di dalam body untuk
    perhitungan Indeks Diskriminasi yang lengkap.
    """
    # Ekstrak dictionary skor jika ada, jika tidak, biarkan None
    all_student_scores = student_scores_input.scores if student_scores_input else None
    
    try:
        # Panggil service dengan data skor yang mungkin ada
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
        # Tambahkan logging di sini jika perlu
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred during analysis.")

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

@router.get(
    "/summary-stats",
    response_model=List[schemas.ItemAnalysisResultRead],
    summary="Get Summary Statistics for Multiple Question Analyses"
)
async def read_analysis_summary_stats(
    db: Session = Depends(get_db),
    subject: Optional[str] = None,
    topic: Optional[str] = None,
    question_type: Optional[str] = None,
    min_responses: Optional[int] = 0, # Jumlah minimal respons yang dianalisis
    skip: int = 0,
    limit: int = 1000,
    item_analysis_service: ItemAnalysisService = Depends(ItemAnalysisService),
    # current_user: User = Depends(get_current_active_user) # Aktifkan jika perlu otorisasi
) -> Any:
    """
    Mengambil ringkasan hasil analisis (P-value, D-index, jumlah respons)
    untuk sekelompok soal. Berguna untuk melihat distribusi atau tren.
    """
    summary_stats = item_analysis_service.get_analysis_results_summary(
        db=db,
        subject=subject,
        topic=topic,
        question_type=question_type,
        min_responses_analyzed=min_responses,
        skip=skip,
        limit=limit
    )
    return summary_stats