// src/pages/QuestionCreatePage.jsx
import React, { useState } from 'react';
import { Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../components/common/PageTitle';
import QuestionForm from '../components/questions/QuestionForm';
import questionService from '../api/questionService';
import { getApiErrorMessage } from '../utils/errors';

const QuestionCreatePage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await questionService.createQuestion(values);
            message.success('Soal baru berhasil dibuat!');
            navigate('/questions'); // Kembali ke daftar soal setelah berhasil
        } catch (error) {
            message.error(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <PageTitle title="Buat Soal Baru" />
            <Card>
                <QuestionForm 
                    onSubmit={handleSubmit} 
                    loading={loading}
                    submitButtonText="Buat Soal"
                />
            </Card>
        </div>
    );
};

export default QuestionCreatePage;
