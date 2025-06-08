// src/pages/StudentReportPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Spin, Table, Tag } from 'antd';
import PageTitle from '../components/common/PageTitle';
import { getApiErrorMessage } from '../utils/errors';
import { formatDateTime } from '../utils/formatters';
import analysisService from '../api/analysisService';

const StudentReportPage = () => {
    const { studentIdentifier } = useParams();
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchResponses = useCallback(async () => {
        setLoading(true);
        try {
            const data = await analysisService.getResponsesByStudent(studentIdentifier);
            setResponses(data);
        } catch (error) {
            message.error(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [studentIdentifier]);

    useEffect(() => {
        fetchResponses();
    }, [fetchResponses]);

    const columns = [
        {
            title: 'Soal',
            dataIndex: ['question', 'content'], // Mengakses nested data
            key: 'question_content',
            render: (text, record) => (
                // Link untuk melihat detail soal
                <a onClick={() => navigate(`/questions/${record.question.id}`)}>
                    {text}
                </a>
            )
        },
        {
            title: 'Status Jawaban',
            dataIndex: 'is_response_correct',
            key: 'is_response_correct',
            render: (isCorrect) => {
                if (isCorrect === null || isCorrect === undefined) {
                    return <Tag>Belum Dinilai</Tag>;
                }
                return isCorrect ? <Tag color="success">Benar</Tag> : <Tag color="error">Salah</Tag>;
            }
        },
        {
            title: 'Waktu Submit',
            dataIndex: 'submitted_at',
            key: 'submitted_at',
            render: (date) => formatDateTime(date)
        }
    ];

    if (loading) {
        return <Spin tip="Memuat riwayat jawaban..." size="large" fullscreen />;
    }

    return (
        <div>
            <PageTitle title={`Riwayat Jawaban untuk: ${studentIdentifier}`} />
            <Table
                columns={columns}
                dataSource={responses}
                rowKey="id"
                scroll={{ x: true }}
            />
        </div>
    );
};

export default StudentReportPage;
