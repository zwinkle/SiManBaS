// src/api/authService.js
import apiClient from './axios';

/**
 * Mengirimkan permintaan login ke backend.
 * @param {string} username - Username pengguna.
 * @param {string} password - Password pengguna.
 * @returns {Promise<object>} Data respons dari API, berisi access_token.
 */
export const login = async (username, password) => {
    // Endpoint login FastAPI dengan OAuth2PasswordRequestForm mengharapkan
    // data dengan format 'application/x-www-form-urlencoded'.
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    try {
        const response = await apiClient.post('/auth/login', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    } catch (error) {
        // Melempar error agar bisa ditangani oleh komponen atau context yang memanggil
        throw error.response?.data || error;
    }
};

/**
 * Mengirimkan permintaan registrasi pengguna baru.
 * @param {object} userData - Objek yang berisi data pengguna baru.
 * @param {string} userData.email
 * @param {string} userData.username
 * @param {string} userData.password
 * @param {string} [userData.full_name]
 * @returns {Promise<object>} Data pengguna yang baru dibuat.
 */
export const register = async (userData) => {
    try {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Mengambil detail profil pengguna yang sedang login.
 * @returns {Promise<object>} Data profil pengguna.
 */
export const getMyProfile = async () => {
    try {
        const response = await apiClient.get('/users/me');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateMyProfile = async (profileData) => {
    try {
        // Memanggil endpoint PUT /users/me yang sudah kita buat di backend.
        const response = await apiClient.put('/users/me', profileData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Gabungkan semua fungsi ke dalam satu objek untuk impor yang lebih mudah
const authService = {
    login,
    register,
    getMyProfile,
    updateMyProfile,
};

export default authService;