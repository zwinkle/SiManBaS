// src/api/userService.js
import apiClient from './axios';

/**
 * Mengambil semua pengguna dari sistem (memerlukan hak akses admin).
 * Endpoint yang dipanggil adalah /users/all, yang perlu dibuat di backend.
 * @returns {Promise<Array<object>>} Array dari data pengguna.
 */
const getAllUsers = async () => {
    try {
        // Endpoint ini diasumsikan ada di backend untuk admin
        const response = await apiClient.get('/users/all');
        return response.data;
    } catch (error) {
        // Melempar error agar bisa ditangani oleh komponen yang memanggil
        throw error.response?.data || error;
    }
};

/**
 * Memperbarui data pengguna berdasarkan ID (memerlukan hak akses admin).
 * @param {string} userId - ID dari pengguna yang akan diperbarui.
 * @param {object} userData - Data pembaruan (misal: { is_active: false }).
 * @returns {Promise<object>} Data pengguna yang telah diperbarui.
 */
const updateUser = async (userId, userData) => {
    try {
        // Endpoint ini diasumsikan ada di backend untuk admin
        const response = await apiClient.put(`/users/${userId}`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const userService = {
    getAllUsers,
    updateUser,
};

export default userService;
