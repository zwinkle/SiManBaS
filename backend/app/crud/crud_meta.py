# backend/app/crud/crud_meta.py

from sqlalchemy.orm import Session
from typing import List
from app.models.question import Question

class CRUDMeta:
    def get_unique_subjects(self, db: Session) -> List[str]:
        """
        Mengambil daftar unik mata pelajaran dari semua soal.
        """
        # Mengambil nilai unik, memfilter None/kosong, dan mengurutkannya
        results = db.query(Question.subject).filter(Question.subject.isnot(None), Question.subject != '').distinct().order_by(Question.subject).all()
        return [result[0] for result in results]

    def get_unique_topics_by_subject(self, db: Session, *, subject: str) -> List[str]:
        """
        Mengambil daftar unik topik untuk mata pelajaran tertentu.
        """
        results = db.query(Question.topic).filter(Question.subject == subject, Question.topic.isnot(None), Question.topic != '').distinct().order_by(Question.topic).all()
        return [result[0] for result in results]

meta = CRUDMeta()