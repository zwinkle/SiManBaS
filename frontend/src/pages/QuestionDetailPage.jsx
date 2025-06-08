// src/pages/QuestionDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Descriptions, Tag, Spin, Tabs, Button, Divider, App, Typography, Space } from 'antd';
import PageTitle from '../components/common/PageTitle';
import CommentList from '../components/comments/CommentList';
import CommentForm from '../components/comments/CommentForm';
import ResponseListTable from '../components/responses/ResponseListTable';
import AnalysisTriggerModal from '../components/analysis/AnalysisTriggerModal';
import questionService from '../api/questionService';
import analysisService from '../api/analysisService';
import { getApiErrorMessage } from '../utils/errors';
import OptionStatsChart from '../components/analysis/OptionStatsChart';
import StatCard from '../components/dashboard/StatCard';
import { BarChartOutlined, CheckCircleOutlined, InfoCircleOutlined, KeyOutlined } from '@ant-design/icons';
import useAuth from '../hooks/useAuth';
import commentService from '../api/commentService';

const { Text } = Typography;

const QuestionDetailPage = () => {
    const { id: questionId } = useParams();
    const { user } = useAuth();
    const { message: messageApi } = App.useApp();
    const navigate = useNavigate();

    // State untuk Data
    const [question, setQuestion] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [optionStats, setOptionStats] = useState(null);
    const [comments, setComments] = useState([]);
    const [studentResponses, setStudentResponses] = useState([]);

    // State untuk Kondisi Loading
    const [loading, setLoading] = useState(true);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);
    const [responsesLoading, setResponsesLoading] = useState(false);

    // State untuk Kontrol UI
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

    // Mengambil data awal (detail soal, komentar, dll.) saat halaman dimuat
    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [questionData, commentsData] = await Promise.all([
                questionService.getQuestionById(questionId),
                commentService.getCommentsForQuestion(questionId),
            ]);
            setQuestion(questionData);
            setComments(commentsData);

            if (questionData.question_type === 'multiple_choice') {
                const statsData = await questionService.getQuestionOptionStats(questionId);
                setOptionStats(statsData);
            }

        } catch (error) {
            messageApi.error(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [questionId, messageApi]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const getCorrectAnswerText = () => {
        if (!question || question.question_type !== 'multiple_choice') {
            return <Text type="secondary">Tidak berlaku untuk tipe soal ini.</Text>;
        }
        const correctOption = question.answer_options.find(opt => opt.is_correct);
        if (correctOption) {
            return <Text strong>{correctOption.option_text}</Text>;
        }
        return <Text type="danger">Kunci jawaban belum diatur!</Text>;
    };

    const runAnalysisWithScores = async (scores) => {
        const scoresPayload = scores ? { scores } : null;
        setAnalysisLoading(true);
        try {
            const newAnalysisData = await analysisService.triggerAnalysis(questionId, scoresPayload);
            setAnalysis(newAnalysisData);
            messageApi.success("Analisis berhasil dijalankan!");
            setIsAnalysisModalOpen(false);
        } catch (error) {
             messageApi.error(getApiErrorMessage(error));
        } finally {
            setAnalysisLoading(false);
        }
    };

    const fetchStudentResponses = useCallback(async () => {
        setResponsesLoading(true);
        try {
            const data = await analysisService.getResponsesForQuestion(questionId);
            setStudentResponses(data);
        } catch (error) {
            messageApi.error(`Gagal memuat jawaban siswa: ${getApiErrorMessage(error)}`);
        } finally {
            setResponsesLoading(false);
        }
    }, [questionId, messageApi]);

    const onTabChange = (key) => {
        if (key === '3' && studentResponses.length === 0) {
            fetchStudentResponses();
        }
    };

    const handleCommentSubmit = async (values) => {
        setCommentLoading(true);
        try {
            await commentService.postCommentForQuestion(questionId, values);
            messageApi.success('Komentar berhasil ditambahkan!');
            const updatedComments = await commentService.getCommentsForQuestion(questionId);
            setComments(updatedComments);
        } catch (error) {
            messageApi.error(getApiErrorMessage(error));
        } finally {
            setCommentLoading(false);
        }
    };

    if (loading) {
        return <Spin tip="Memuat detail soal..." size="large" fullscreen />;
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
                    <Button onClick={() => setIsAnalysisModalOpen(true)} style={{marginBottom: 16}}>
                        Analisis Ulang dengan Skor
                    </Button>
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
                <Descriptions title="Informasi Soal" bordered column={1}>
                    <Descriptions.Item label="Isi Pertanyaan">{question.content}</Descriptions.Item>
                    <Descriptions.Item label="Mata Pelajaran">{question.subject}</Descriptions.Item>
                    <Descriptions.Item label="Topik">{question.topic}</Descriptions.Item>
                    <Descriptions.Item label="Tipe Soal">
                        <Tag color="blue">{question.question_type.replace('_', ' ').toUpperCase()}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={<Space><KeyOutlined /> Kunci Jawaban</Space>}>
                        {getCorrectAnswerText()}
                    </Descriptions.Item>
                </Descriptions>
            </Card>
            
            <Card>
                <Tabs defaultActiveKey="1" items={tabItems} onChange={onTabChange} />
            </Card>

            <Card title="Diskusi & Umpan Balik" style={{ marginTop: 24 }}>
                <CommentList comments={comments} />
                <Divider />
                {user ? (
                    <CommentForm onSubmit={handleCommentSubmit} loading={commentLoading} />
                ) : (
                    <p>Silakan login untuk memberikan komentar.</p>
                )}
            </Card>

            <AnalysisTriggerModal
                open={isAnalysisModalOpen}
                onCancel={() => setIsAnalysisModalOpen(false)}
                onRunAnalysis={runAnalysisWithScores}
                loading={analysisLoading}
            />
        </div>
    );
};

export default QuestionDetailPage;
