# backend/app/services/statistics_service.py

from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func

from app import crud
from app.models.user import User
from app.models.question import Question
from app.models.item_analysis_result import ItemAnalysisResult
from app.schemas.statistics import AdminDashboardStats, TeacherDashboardStats

class StatisticsService:
    def get_admin_dashboard_stats(self, db: Session) -> AdminDashboardStats:
        """
        Mengumpulkan data statistik agregat untuk dashboard admin.
        """
        total_questions = db.query(Question).count()
        total_users = db.query(User).count()

        recent_questions = (
            db.query(Question)
            .options(selectinload(Question.creator)) # Eager load data pembuat
            .order_by(Question.created_at.desc())
            .limit(5)
            .all()
        )

        worst_questions = (
            db.query(ItemAnalysisResult)
            .options(selectinload(ItemAnalysisResult.question)) # Eager load data soal
            .filter(ItemAnalysisResult.discrimination_index != None)
            .order_by(ItemAnalysisResult.discrimination_index.asc())
            .limit(5)
            .all()
        )

        return AdminDashboardStats(
            total_questions=total_questions,
            total_users=total_users,
            recent_questions=recent_questions,
            worst_questions=worst_questions
        )

    def get_teacher_dashboard_stats(self, db: Session, *, current_user: User) -> TeacherDashboardStats:
        """
        Mengumpulkan data statistik personal untuk dashboard pengajar.
        """
        total_questions_created = (
            db.query(Question)
            .filter(Question.created_by_user_id == current_user.id)
            .count()
        )

        # Hitung rata-rata P-Value dan D-Index untuk soal milik pengguna
        avg_stats = (
            db.query(
                func.avg(ItemAnalysisResult.difficulty_index_p_value).label("avg_p_value"),
                func.avg(ItemAnalysisResult.discrimination_index).label("avg_d_index")
            )
            .join(Question, ItemAnalysisResult.question_id == Question.id)
            .filter(Question.created_by_user_id == current_user.id)
            .one()
        )

        return TeacherDashboardStats(
            total_questions_created=total_questions_created,
            average_p_value=avg_stats.avg_p_value,
            average_d_index=avg_stats.avg_d_index
        )

statistics_service = StatisticsService()