# backend/app/schemas/item_analysis_result.py
from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class ItemAnalysisResultBase(BaseModel):
    """
    Atribut dasar untuk hasil analisis item.
    """
    question_id: UUID
    test_session_identifier: Optional[str] = None
    difficulty_index_p_value: Optional[float] = None
    discrimination_index: Optional[float] = None
    responses_analyzed_count: Optional[int] = None

class ItemAnalysisResultRead(ItemAnalysisResultBase):
    """
    Skema untuk membaca data hasil analisis item.
    """
    id: UUID
    last_analyzed_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Anda mungkin tidak memerlukan skema Create atau Update untuk ItemAnalysisResult
# karena biasanya ini dihasilkan oleh sistem setelah proses analisis.