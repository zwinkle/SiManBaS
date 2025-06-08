// src/api/questionService.js
import apiClient from './axios';

/**
 * Membuat soal baru.
 * @param {object} questionData - Data soal sesuai skema QuestionCreate.
 * @returns {Promise<object>} Data soal yang baru dibuat.
 */
export const createQuestion = async (questionData) => {
    try {
        const response = await apiClient.post('/questions', questionData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Mengambil daftar soal dengan filter dan paginasi.
 * @param {object} params - Parameter query.
 * @param {number} [params.skip=0]
 * @param {number} [params.limit=10]
 * @param {string} [params.subject]
 * @param {string} [params.topic]
 * @param {string} [params.question_type]
 * @returns {Promise<Array<object>>} Array dari data soal.
 */
export const getQuestions = async (params) => {
    try {
        const response = await apiClient.get('/questions', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Mengambil detail satu soal berdasarkan ID.
 * @param {string} questionId - ID dari soal.
 * @returns {Promise<object>} Data detail soal.
 */
export const getQuestionById = async (questionId) => {
    try {
        const response = await apiClient.get(`/questions/${questionId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Memperbarui soal yang ada.
 * @param {string} questionId - ID dari soal yang akan diperbarui.
 * @param {object} questionData - Data pembaruan sesuai skema QuestionUpdate.
 * @returns {Promise<object>} Data soal yang telah diperbarui.
 */
export const updateQuestion = async (questionId, questionData) => {
    try {
        const response = await apiClient.put(`/questions/${questionId}`, questionData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Menghapus soal.
 * @param {string} questionId - ID dari soal yang akan dihapus.
 * @returns {Promise<void>}
 */
export const deleteQuestion = async (questionId) => {
    try {
        await apiClient.delete(`/questions/${questionId}`);
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Mengambil statistik pemilihan opsi untuk soal pilihan ganda.
 * @param {string} questionId - ID dari soal.
 * @returns {Promise<object>} Data statistik opsi.
 */
export const getQuestionOptionStats = async (questionId) => {
    try {
        const response = await apiClient.get(`/questions/${questionId}/option-stats`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const questionService = {
    createQuestion,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    getQuestionOptionStats,
};

export default questionService;