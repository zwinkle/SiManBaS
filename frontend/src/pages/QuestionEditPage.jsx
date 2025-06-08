// src/pages/QuestionEditPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, message, Spin, Alert } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import PageTitle from '../components/common/PageTitle';
import QuestionForm from '../components/questions/QuestionForm';
import questionService from '../api/questionService';
import { getApiErrorMessage } from '../utils/errors';

const QuestionEditPage = () => {
    // 1. Mengambil 'id' dari parameter URL
    const { id: questionId } = useParams();
    const navigate = useNavigate();

    // State untuk menyimpan data awal soal yang akan diedit
    const [initialData, setInitialData] = useState(null);
    // State untuk loading saat mengambil data awal
    const [loading, setLoading] = useState(true);
    // State untuk loading saat form di-submit
    const [submitting, setSubmitting] = useState(false);

    const fetchQuestion = useCallback(async () => {
        try {
            setLoading(true);
            const data = await questionService.getQuestionById(questionId);
            setInitialData(data);
        } catch (error) {
            message.error(getApiErrorMessage(error));
            // Jika soal tidak ditemukan, arahkan kembali ke daftar soal
            navigate('/questions');
        } finally {
            setLoading(false);
        }
    }, [questionId, navigate]);

    // 2. Mengambil data soal saat komponen pertama kali dimuat
    useEffect(() => {
        fetchQuestion();
    }, [fetchQuestion]);

    // 3. Fungsi yang akan dijalankan saat form di-submit
    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            await questionService.updateQuestion(questionId, values);
            message.success('Soal berhasil diperbarui!');
            navigate('/questions'); // Kembali ke daftar soal setelah berhasil
        } catch (error) {
            message.error(getApiErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    // Tampilkan loader saat data awal sedang diambil
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spin tip="Memuat data soal..." size="large" />
            </div>
        );
    }
    
    // Tampilkan pesan jika data tidak berhasil dimuat
    if (!initialData) {
         return <Alert message="Error" description="Tidak dapat memuat data soal untuk diedit." type="error" showIcon />;
    }

    // 4. Render form dengan data yang sudah terisi
    return (
        <div>
            <PageTitle title="Edit Soal" />
            <Card>
                <QuestionForm 
                    initialValues={initialData}
                    onSubmit={handleSubmit}
                    loading={submitting}
                    submitButtonText="Simpan Perubahan"
                />
            </Card>
        </div>
    );
};

export default QuestionEditPage;
