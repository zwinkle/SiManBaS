// src/api/statisticsService.js
import apiClient from './axios';

/**
 * Mengambil data statistik ringkasan untuk dashboard Admin.
 * Endpoint ini perlu dibuat di backend dan dilindungi untuk peran admin.
 * @returns {Promise<object>} Data statistik untuk admin.
 */
const getAdminDashboardStats = async () => {
    try {
        // Asumsi endpoint ini ada di backend
        const response = await apiClient.get('/statistics/admin-dashboard');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Mengambil data statistik personal untuk dashboard Pengajar (Teacher).
 * Endpoint ini perlu dibuat di backend dan akan menggunakan ID pengguna dari token.
 * @returns {Promise<object>} Data statistik untuk pengajar.
 */
const getTeacherDashboardStats = async () => {
    try {
        // Asumsi endpoint ini ada di backend
        const response = await apiClient.get('/statistics/teacher-dashboard');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const statisticsService = {
    getAdminDashboardStats,
    getTeacherDashboardStats,
};

export default statisticsService;
