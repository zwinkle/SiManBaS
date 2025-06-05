# backend/app/crud/crud_item_analysis_result.py
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from app.crud.base import CRUDBase
from app.models.item_analysis_result import ItemAnalysisResult
from app.schemas.item_analysis_result import ItemAnalysisResultBase # Digunakan untuk create/update

class CRUDItemAnalysisResult(CRUDBase[ItemAnalysisResult, ItemAnalysisResultBase, ItemAnalysisResultBase]):
    def get_by_question_and_session(
        self, db: Session, *, question_id: UUID, test_session_identifier: Optional[str] = None
    ) -> Optional[ItemAnalysisResult]:
        """
        Mengambil hasil analisis berdasarkan question_id dan test_session_identifier.
        """
        query = db.query(self.model).filter(self.model.question_id == question_id)
        if test_session_identifier is not None:
            query = query.filter(self.model.test_session_identifier == test_session_identifier)
        else:
            # Jika test_session_identifier adalah None, kita cari yang NULL di DB
            query = query.filter(self.model.test_session_identifier.is_(None))
        return query.first()

    def create_or_update(
        self, db: Session, *, obj_in: ItemAnalysisResultBase
    ) -> ItemAnalysisResult:
        """
        Membuat hasil analisis baru atau memperbarui yang sudah ada
        berdasarkan question_id dan test_session_identifier.
        """
        existing_analysis = self.get_by_question_and_session(
            db,
            question_id=obj_in.question_id,
            test_session_identifier=obj_in.test_session_identifier
        )
        if existing_analysis:
            return self.update(db, db_obj=existing_analysis, obj_in=obj_in)
        else:
            return self.create(db, obj_in=obj_in)

item_analysis_result = CRUDItemAnalysisResult(ItemAnalysisResult)