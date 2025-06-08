// src/utils/formatters.js

/**
 * Memformat string tanggal ISO menjadi format yang lebih mudah dibaca (misal: 8 Juni 2025, 07:47).
 * Menggunakan Intl.DateTimeFormat bawaan browser untuk lokalisasi.
 * @param {string} isoString - String tanggal dalam format ISO 8601.
 * @returns {string} Tanggal yang sudah diformat atau string kosong jika input tidak valid.
 */
export const formatDateTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      // Opsi untuk format tanggal dan waktu dalam bahasa Indonesia
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Gunakan format 24 jam
      };
      return new Intl.DateTimeFormat('id-ID', options).format(date);
    } catch (error) {
      console.error("Invalid date string for formatting:", isoString, error);
      return isoString; // Kembalikan string asli jika terjadi error
    }
  };
  
  /**
   * Memotong teks jika melebihi panjang maksimum dan menambahkan elipsis (...).
   * @param {string} text - Teks yang akan dipotong.
   * @param {number} maxLength - Panjang maksimum teks sebelum dipotong.
   * @returns {string} Teks yang sudah dipotong.
   */
  export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return `${text.substring(0, maxLength)}...`;
  };