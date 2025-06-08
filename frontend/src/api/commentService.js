// src/api/commentService.js
import apiClient from './axios';

/**
 * Mengambil semua komentar untuk soal tertentu.
 * @param {string} questionId - ID dari soal.
 * @returns {Promise<Array<object>>} Array dari data komentar.
 */
const getCommentsForQuestion = async (questionId) => {
    try {
        const response = await apiClient.get(`/questions/${questionId}/comments`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Mengirimkan komentar baru untuk soal tertentu.
 * @param {string} questionId - ID dari soal.
 * @param {object} commentData - Objek berisi { content: "..." }.
 * @returns {Promise<object>} Data komentar yang baru dibuat.
 */
const postCommentForQuestion = async (questionId, commentData) => {
    try {
        const response = await apiClient.post(`/questions/${questionId}/comments`, commentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const commentService = {
    getCommentsForQuestion,
    postCommentForQuestion,
};

export default commentService;