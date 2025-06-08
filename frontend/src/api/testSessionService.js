// src/api/testSessionService.js

import apiClient from './axios';

const getSessions = async (params) => {
    return (await apiClient.get('/test-sessions', { params })).data;
};

const getSessionById = async (id) => {
    return (await apiClient.get(`/test-sessions/${id}`)).data;
};

const createSession = async (sessionData) => {
    return (await apiClient.post('/test-sessions', sessionData)).data;
};

const updateSession = async (sessionId, sessionData) => {
    return (await apiClient.put(`/test-sessions/${sessionId}`, sessionData)).data;
};

const deleteSession = async (sessionId) => {
    await apiClient.delete(`/test-sessions/${sessionId}`);
};

const addQuestionsToSession = async (id, questionIds) => {
    return (await apiClient.post(`/test-sessions/${id}/questions`, { question_ids: questionIds })).data;
};

const downloadAnswerSheet = async (id) => {
    const response = await apiClient.get(`/test-sessions/${id}/answer-sheet-template`, {
        responseType: 'blob', // Penting untuk menangani file download
    });
    // Buat URL blob dan picu download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    // Ambil nama file dari header Content-Disposition
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `template_jawaban.csv`;
    if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch.length === 2)
            fileName = fileNameMatch[1];
    }
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
};

const testSessionService = {
    getSessions,
    getSessionById,
    createSession,
    updateSession,
    deleteSession,
    addQuestionsToSession,
    downloadAnswerSheet,
};

export default testSessionService;