// src/api/rosterService.js
import apiClient from './axios';

/**
 * Mengambil semua kelas/roster milik pengguna saat ini.
 */
const getRosters = async () => {
    return (await apiClient.get('/rosters/')).data;
};

/**
 * Membuat kelas/roster baru.
 * @param {{name: string, description?: string}} data - Data kelas baru.
 */
const createRoster = async (data) => {
    return (await apiClient.post('/rosters/', data)).data;
};

/**
 * Mengambil detail satu kelas/roster berdasarkan ID.
 * @param {string} id - UUID dari roster.
 */
const getRosterDetails = async (id) => {
    return (await apiClient.get(`/rosters/${id}`)).data;
};

/**
 * Memperbarui kelas/roster.
 * @param {string} id - UUID dari roster.
 * @param {{name: string, description?: string}} data - Data pembaruan.
 */
const updateRoster = async (id, data) => {
    return (await apiClient.put(`/rosters/${id}`, data)).data;
};

/**
 * Menghapus kelas/roster.
 * @param {string} id - UUID dari roster.
 */
const deleteRoster = async (id) => {
    await apiClient.delete(`/rosters/${id}`);
};

/**
 * Mengunduh template CSV untuk daftar siswa.
 */
const downloadRosterTemplate = async () => {
    const response = await apiClient.get('/rosters/templates/students', {
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_daftar_siswa.csv');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
};

/**
 * Mengunggah file CSV daftar siswa ke kelas tertentu.
 * @param {string} rosterId - UUID dari roster.
 * @param {File} file - File CSV yang akan diunggah.
 */
const uploadStudentList = async (rosterId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return (await apiClient.post(`/rosters/${rosterId}/students/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
};

const rosterService = {
    getRosters,
    createRoster,
    getRosterDetails,
    updateRoster,
    deleteRoster,
    downloadRosterTemplate,
    uploadStudentList
};

export default rosterService;