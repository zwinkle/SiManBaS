// src/pages/QuestionDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card, Descriptions, Tag, Spin, message, Tabs, Button, Divider } from 'antd';
import PageTitle from '../components/common/PageTitle';
import CommentList from '../components/comments/CommentList';
import CommentForm from '../components/comments/CommentForm';
import ResponseListTable from '../components/responses/ResponseListTable';
import questionService from '../api/questionService';
import analysisService from '../api/analysisService';
import { getApiErrorMessage } from '../utils/errors';
import OptionStatsChart from '../components/analysis/OptionStatsChart';
import StatCard from '../components/dashboard/StatCard';
import { BarChartOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import useAuth from '../hooks/useAuth';
import commentService from '../api/commentService';

const QuestionDetailPage = () => {
    const { id: questionId } = useParams();
    const { user } = useAuth();
    const [question, setQuestion] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [optionStats, setOptionStats] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [studentResponses, setStudentResponses] = useState([]);
    const [commentLoading, setCommentLoading] = useState(false);

    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            // Ambil data secara paralel
            const [questionData, analysisData, statsData] = await Promise.all([
                questionService.getQuestionById(questionId),
                analysisService.triggerAnalysis(questionId), // Selalu coba trigger analisis saat load
                questionService.getQuestionOptionStats(questionId),
            ]);
            setQuestion(questionData);
            setAnalysis(analysisData);
            setOptionStats(statsData);
        } catch (error) {
            message.error(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [questionId]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const fetchStudentResponses = useCallback(async () => {
        setResponsesLoading(true);
        try {
            // TODO: Buat fungsi getResponsesForQuestion di analysisService
            // const data = await analysisService.getResponsesForQuestion(questionId);
            // setStudentResponses(data);

            // Untuk sekarang, kita buat data dummy agar UI bisa dilihat
             const dummyResponses = [
                { id: 'resp1', student_identifier: 'siswa01', test_session_identifier: 'UTSPAGI2025', selected_option_id: 'opt1-id', is_response_correct: false, submitted_at: new Date().toISOString() },
                { id: 'resp2', student_identifier: 'siswa02', test_session_identifier: 'UTSPAGI2025', selected_option_id: 'opt2-id', is_response_correct: true, submitted_at: new Date().toISOString() },
             ];
             setStudentResponses(dummyResponses);
        } catch (error) {
            message.error(`Gagal memuat jawaban siswa: ${getApiErrorMessage(error)}`);
        } finally {
            setResponsesLoading(false);
        }
    }, [questionId]);

    const onTabChange = (key) => {
        if (key === '3' && studentResponses.length === 0) {
            fetchStudentResponses();
        }
    };

    const fetchComments = useCallback(async () => {
        try {
            const commentsData = await commentService.getCommentsForQuestion(questionId);
            setComments(commentsData);
        } catch (error) {
            message.error(`Gagal memuat komentar: ${getApiErrorMessage(error)}`);
        }
    }, [questionId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleCommentSubmit = async (values) => {
        setCommentLoading(true);
        try {
            // Panggil service untuk mengirim komentar
            await commentService.postCommentForQuestion(questionId, values);
            message.success('Komentar berhasil ditambahkan!');
            // Muat ulang daftar komentar untuk menampilkan yang baru
            fetchComments();
        } catch (error) {
            message.error(getApiErrorMessage(error));
        } finally {
            setCommentLoading(false);
        }
    };

    const handleReanalyze = async () => {
        // TODO: Buat modal untuk input data skor total siswa jika diperlukan untuk D-Index
        const studentScoresPayload = null; // Ganti dengan data skor jika ada
        setAnalysisLoading(true);
        try {
            const newAnalysisData = await analysisService.triggerAnalysis(questionId, studentScoresPayload);
            setAnalysis(newAnalysisData);
            message.success("Analisis ulang berhasil!");
        } catch (error) {
             message.error(getApiErrorMessage(error));
        } finally {
            setAnalysisLoading(false);
        }
    }

    if (loading) {
        return <Spin tip="Memuat detail soal..." size="large" style={{ display: 'block', marginTop: '50px' }} />;
    }

    if (!question) {
        return <PageTitle title="Soal Tidak Ditemukan" />;
    }

    const tabItems = [
        {
            key: '1',
            label: 'Hasil Analisis',
            children: (
                <Spin spinning={analysisLoading}>
                    <Button onClick={handleReanalyze} style={{marginBottom: 16}}>Analisis Ulang</Button>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                            <StatCard title="P-Value (Tingkat Kesulitan)" value={analysis?.difficulty_index_p_value ?? 'N/A'} precision={3} icon={<CheckCircleOutlined />} />
                        </Col>
                         <Col xs={24} md={8}>
                            <StatCard title="D-Index (Daya Pembeda)" value={analysis?.discrimination_index ?? 'N/A'} precision={3} icon={<BarChartOutlined />} />
                        </Col>
                        <Col xs={24} md={8}>
                            <StatCard title="Jumlah Respons Dianalisis" value={analysis?.responses_analyzed_count ?? 0} icon={<InfoCircleOutlined />} />
                        </Col>
                    </Row>
                </Spin>
            ),
        },
        {
            key: '2',
            label: 'Statistik Pilihan Jawaban',
            children: <OptionStatsChart statsData={optionStats} />,
            disabled: question.question_type !== 'multiple_choice',
        },
        {
            key: '3',
            label: 'Jawaban Siswa',
            children: (
                <ResponseListTable 
                    responses={studentResponses} 
                    loading={responsesLoading}
                />
            ),
        },
    ];

    return (
        <div>
            <PageTitle title="Detail & Analisis Soal" />
            <Card style={{ marginBottom: 24 }}>
                <Descriptions title="Informasi Soal" bordered>
                    <Descriptions.Item label="Isi Pertanyaan" span={3}>{question.content}</Descriptions.Item>
                    <Descriptions.Item label="Mata Pelajaran">{question.subject}</Descriptions.Item>
                    <Descriptions.Item label="Topik">{question.topic}</Descriptions.Item>
                    <Descriptions.Item label="Tipe Soal">
                        <Tag color="blue">{question.question_type.replace('_', ' ').toUpperCase()}</Tag>
                    </Descriptions.Item>
                </Descriptions>
            </Card>
            
            <Card>
                <Tabs defaultActiveKey="1" items={tabItems} onChange={onTabChange} />
            </Card>

            <Card title="Diskusi & Umpan Balik" style={{ marginTop: 24 }}>
                {comments.length > 0 && <CommentList comments={comments} />}
                <Divider />
                {user ? (
                    <CommentForm onSubmit={handleCommentSubmit} loading={commentLoading} />
                ) : (
                    <p>Silakan login untuk memberikan komentar.</p>
                )}
            </Card>
        </div>
    );
};

export default QuestionDetailPage;
