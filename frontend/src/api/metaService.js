// src/api/metaService.js
import apiClient from './axios';

/**
 * Mengambil daftar unik mata pelajaran.
 * @returns {Promise<Array<string>>}
 */
const getSubjects = async () => {
    try {
        const response = await apiClient.get('/meta/subjects');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Mengambil daftar unik topik berdasarkan mata pelajaran.
 * @param {string} subject - Nama mata pelajaran.
 * @returns {Promise<Array<string>>}
 */
const getTopics = async (subject) => {
    try {
        const response = await apiClient.get('/meta/topics', { params: { subject } });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const metaService = {
    getSubjects,
    getTopics,
};

export default metaService;