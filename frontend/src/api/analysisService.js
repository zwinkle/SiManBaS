// src/api/analysisService.js
import apiClient from './axios';

/**
 * Mengirimkan sekumpulan (batch) jawaban siswa.
 * @param {Array<object>} responsesData - Array dari objek respons siswa sesuai skema StudentResponseCreate.
 * @returns {Promise<object>} Pesan sukses.
 */
export const submitStudentResponses = async (responsesData) => {
    try {
        const response = await apiClient.post('/responses/bulk', responsesData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Memicu analisis untuk soal tertentu.
 * @param {string} questionId - ID soal yang akan dianalisis.
 * @param {object} [scoresPayload=null] - Payload opsional berisi skor total siswa untuk analisis Indeks Diskriminasi.
 * @returns {Promise<object>} Hasil analisis item.
 */
export const triggerAnalysis = async (questionId, scoresPayload = null) => {
    try {
        // Kirim payload hanya jika ada isinya
        const response = await apiClient.post(`/analysis/questions/${questionId}`, scoresPayload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Mengambil ringkasan hasil analisis untuk banyak soal dengan filter.
 * @param {object} params - Parameter query.
 * @param {string} [params.subject]
 * @param {string} [params.topic]
 * @param {number} [params.min_responses]
 * @param {number} [params.skip=0]
 * @param {number} [params.limit=100]
 * @returns {Promise<Array<object>>} Array dari hasil analisis.
 */
export const getAnalysisSummary = async (params) => {
    try {
        const response = await apiClient.get('/analysis/summary-stats', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const analysisService = {
    submitStudentResponses,
    triggerAnalysis,
    getAnalysisSummary,
};

export default analysisService;