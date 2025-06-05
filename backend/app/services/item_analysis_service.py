# backend/app/services/item_analysis_service.py
from sqlalchemy.orm import Session, selectinload
from typing import Optional, List, Dict # Tambahkan Dict
from uuid import UUID
from fastapi import HTTPException, status
import math # Untuk pembulatan dalam pengelompokan

from app import schemas, crud
from app.models.student_response import StudentResponse
from app.models.question import Question
from app.models.answer_option import AnswerOption
from app.core.config import settings # Jika ada setting terkait analisis

class ItemAnalysisService:
    def _get_responses_for_analysis(
        self, db: Session, question_id: UUID, test_session_identifier: Optional[str] = None
    ) -> List[StudentResponse]:
        """Helper untuk mengambil respons yang relevan, sudah di-load dengan relasi yang mungkin dibutuhkan."""
        query = db.query(StudentResponse).filter(StudentResponse.question_id == question_id)
        if test_session_identifier:
            query = query.filter(StudentResponse.test_session_identifier == test_session_identifier)

        # Eager load relasi yang mungkin dibutuhkan untuk menentukan jawaban benar
        query = query.options(
            selectinload(StudentResponse.question).selectinload(Question.answer_options),
            selectinload(StudentResponse.selected_option)
        )
        responses: List[StudentResponse] = query.all()

        if not responses:
            # Tidak perlu HTTPException di sini, biarkan fungsi pemanggil yang menangani
            # jika tidak ada respons berarti analisis tidak bisa dilakukan.
            return [] 
        return responses

    def _get_correct_answer_option_id_for_question(self, question: Question) -> Optional[UUID]:
        """Helper untuk mendapatkan ID opsi jawaban yang benar untuk soal pilihan ganda."""
        if question and question.question_type == "multiple_choice":
            for option in question.answer_options: # Asumsi answer_options sudah di-load
                if option.is_correct:
                    return option.id
        return None

    def calculate_difficulty_index(
        self, question: Question, responses: List[StudentResponse]
    ) -> Optional[float]:
        """Menghitung Indeks Tingkat Kesulitan (P-value)."""
        if not responses:
            return None

        responses_analyzed_count = len(responses)
        correct_answers_count = 0

        if question.question_type == "multiple_choice":
            correct_option_id = self._get_correct_answer_option_id_for_question(question)
            # Jika soal MC tidak punya kunci jawaban, P-value tidak bisa dihitung atau dianggap 0
            if correct_option_id is None and responses_analyzed_count > 0:
                 return 0.0 

            for res in responses:
                if res.selected_option_id == correct_option_id:
                    correct_answers_count += 1
        elif question.question_type in ["essay", "short_answer"]:
            for res in responses:
                if res.is_response_correct is True: # Asumsi sudah dinilai
                    correct_answers_count += 1
        else:
            return None # Tipe soal tidak didukung untuk P-value otomatis

        p_value = (
            round(correct_answers_count / responses_analyzed_count, 4)
            if responses_analyzed_count > 0 else None
        )
        return p_value

    def calculate_discrimination_index(
        self,
        question: Question,
        responses_for_question: List[StudentResponse],
        all_student_total_scores: Dict[str, float] # Format: {student_identifier: total_score}
    ) -> Optional[float]:
        """
        Menghitung Indeks Daya Pembeda.
        Membutuhkan skor total semua siswa pada tes yang relevan.
        """
        if not responses_for_question or not all_student_total_scores or len(responses_for_question) < 10:
            # Butuh minimal data & skor total untuk analisis yang berarti
            # Angka 10 adalah contoh, idealnya lebih banyak
            return None

        # Filter siswa yang mengerjakan soal ini DAN memiliki skor total
        relevant_students_with_scores = []
        for res in responses_for_question:
            if res.student_identifier in all_student_total_scores:
                relevant_students_with_scores.append({
                    "identifier": res.student_identifier,
                    "total_score": all_student_total_scores[res.student_identifier],
                    "response_object": res # Simpan objek respons untuk cek jawaban benar
                })

        if not relevant_students_with_scores or len(relevant_students_with_scores) < 10:
            return None # Tidak cukup data siswa yang relevan

        # Urutkan siswa berdasarkan skor total
        relevant_students_with_scores.sort(key=lambda x: x["total_score"], reverse=True)

        # Tentukan kelompok atas dan bawah (misal, 27% atau 33%)
        # Untuk S1, pembagian menjadi 2 kelompok (atas & bawah median) juga bisa jadi penyederhanaan.
        # Mari kita coba dengan 27% jika jumlah siswa memungkinkan, atau median split.
        n_total_relevant = len(relevant_students_with_scores)
        n_group = math.ceil(n_total_relevant * 0.27) # Ambil 27% teratas dan terbawah

        if n_group < 2: # Minimal 2 siswa per kelompok untuk perbandingan
            # Jika terlalu sedikit, bisa coba split median
            if n_total_relevant >= 4: # Minimal 4 siswa untuk split median (2 atas, 2 bawah)
                median_idx = n_total_relevant // 2
                upper_group_responses = [s["response_object"] for s in relevant_students_with_scores[:median_idx]]
                lower_group_responses = [s["response_object"] for s in relevant_students_with_scores[median_idx:]]
            else:
                return None # Data tidak cukup untuk membentuk kelompok
        else:
            upper_group_responses = [s["response_object"] for s in relevant_students_with_scores[:n_group]]
            lower_group_responses = [s["response_object"] for s in relevant_students_with_scores[-n_group:]]

        # Hitung Pu (Proporsi benar di kelompok atas)
        pu_value = self.calculate_difficulty_index(question, upper_group_responses)

        # Hitung Pl (Proporsi benar di kelompok bawah)
        pl_value = self.calculate_difficulty_index(question, lower_group_responses)

        if pu_value is not None and pl_value is not None:
            discrimination_index = round(pu_value - pl_value, 4)
            return discrimination_index

        return None

    def get_or_create_analysis_for_question(
        self,
        db: Session,
        question_id: UUID,
        test_session_identifier: Optional[str] = None,
        # Terima data skor total siswa secara opsional
        all_student_total_scores_for_test: Optional[Dict[str, float]] = None
    ) -> schemas.ItemAnalysisResultRead:
        """
        Menghitung atau mengambil hasil analisis item untuk sebuah soal.
        """
        question = crud.question.get(db=db, id=question_id) # crud.question.get sudah eager load options & creator
        if not question:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Question with id {question_id} not found.")

        relevant_responses = self._get_responses_for_analysis(db, question_id, test_session_identifier)

        if not relevant_responses:
             # Jika tidak ada respons, mungkin kita simpan hasil analisis dengan nilai None atau 0
            p_value = None
            d_index = None
            responses_count = 0
        else:
            responses_count = len(relevant_responses)
            p_value = self.calculate_difficulty_index(question, relevant_responses)

            # Hitung D-Index jika data skor total diberikan
            d_index = None
            if all_student_total_scores_for_test:
                d_index = self.calculate_discrimination_index(
                    question, relevant_responses, all_student_total_scores_for_test
                )

        analysis_data_in = schemas.ItemAnalysisResultBase(
            question_id=question_id,
            test_session_identifier=test_session_identifier,
            difficulty_index_p_value=p_value,
            discrimination_index=d_index,
            responses_analyzed_count=responses_count,
        )

        analysis_result_orm = crud.item_analysis_result.create_or_update(db=db, obj_in=analysis_data_in)

        if not analysis_result_orm:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not save analysis result.")

        return schemas.ItemAnalysisResultRead.model_validate(analysis_result_orm)
    
    def get_question_option_statistics(
        self, db: Session, question_id: UUID
    ) -> schemas.QuestionOptionStatsRead: # Menggunakan skema yang baru dibuat
        """
        Menghitung dan mengembalikan statistik pemilihan untuk setiap opsi jawaban dari sebuah soal.
        Hanya relevan untuk soal pilihan ganda.
        """
        question = crud.question.get(db, id=question_id) # crud.question.get sudah eager load options
        if not question:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Question with id {question_id} not found.")
        
        if question.question_type != "multiple_choice":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Option statistics are only available for multiple-choice questions.")

        student_responses = db.query(StudentResponse).filter(StudentResponse.question_id == question_id).all()
        total_responses_for_question = len(student_responses)

        options_stats_data: List[schemas.OptionStatData] = []

        if not question.answer_options:
            return schemas.QuestionOptionStatsRead(
                question_id=question_id,
                question_content=question.content,
                question_type=question.question_type,
                total_responses_for_question=total_responses_for_question,
                options_stats=[]
            )

        for option in question.answer_options:
            selection_count = 0
            for response in student_responses:
                if response.selected_option_id == option.id:
                    selection_count += 1
            
            selection_percentage = (
                round((selection_count / total_responses_for_question) * 100, 2)
                if total_responses_for_question > 0 else 0.0
            )
            
            options_stats_data.append(
                schemas.OptionStatData(
                    option_id=option.id,
                    option_text=option.option_text,
                    is_correct=option.is_correct, # Menambahkan info kunci jawaban
                    selection_count=selection_count,
                    selection_percentage=selection_percentage
                )
            )
            
        return schemas.QuestionOptionStatsRead(
            question_id=question_id,
            question_content=question.content,
            question_type=question.question_type,
            total_responses_for_question=total_responses_for_question,
            options_stats=options_stats_data
        )