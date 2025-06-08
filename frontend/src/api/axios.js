// src/api/axios.js
import axios from 'axios';

/**
 * Instance Axios global yang telah dikonfigurasi untuk berkomunikasi
 * dengan backend API SiManBaS.
 */
const apiClient = axios.create({
    // Mengambil URL dasar API dari environment variables yang di-set oleh Vite.
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Interceptor untuk request:
 * Sebelum setiap request dikirim, fungsi ini akan dijalankan.
 * Tujuannya adalah untuk mengambil access token dari localStorage dan
 * menyisipkannya ke dalam header 'Authorization' jika token tersebut ada.
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Lakukan sesuatu dengan error request
        return Promise.reject(error);
    }
);

export default apiClient;