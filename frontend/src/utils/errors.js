// src/utils/errors.js

/**
 * Mengekstrak pesan error yang mudah dipahami dari objek error Axios atau error lainnya.
 * @param {object} error - Objek error yang dilempar oleh Axios atau lainnya.
 * @returns {string} Pesan error yang siap ditampilkan.
 */
export const getApiErrorMessage = (error) => {
    if (error.response && error.response.data) {
      // Error dari backend FastAPI biasanya memiliki format { detail: "pesan error" }
      if (typeof error.response.data.detail === 'string') {
        return error.response.data.detail;
      }
      // Menangani error validasi Pydantic yang lebih kompleks
      if (Array.isArray(error.response.data.detail)) {
        const firstError = error.response.data.detail[0];
        return `${firstError.loc.join(' -> ')}: ${firstError.msg}`;
      }
    }
    // Error jaringan atau error lainnya
    if (error.message) {
      return error.message;
    }
    return 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';
  };