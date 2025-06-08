// src/pages/TestSessionDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Card, Spin, message, Button, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PageTitle from '../components/common/PageTitle';
import QuestionList from '../components/questions/QuestionList';
import AddQuestionsModal from '../components/sessions/AddQuestionsModal';
import testSessionService from '../api/testSessionService';

const TestSessionDetailPage = () => {
    const { id: sessionId } = useParams();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchSessionDetails = useCallback(async () => {
        setLoading(true);
        try {
            const data = await testSessionService.getSessionById(sessionId);
            setSession(data);
        } catch (error) {
            message.error("Gagal memuat detail sesi.");
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        fetchSessionDetails();
    }, [fetchSessionDetails]);

    if (loading) {
        return <Spin size="large" fullscreen />;
    }

    if (!session) {
        return <PageTitle title="Sesi Ujian Tidak Ditemukan" />;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <PageTitle title={session.name} />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Tambah Soal</Button>
            </div>

            <Card style={{ marginBottom: 24 }}>
                <Descriptions bordered>
                    <Descriptions.Item label="Deskripsi" span={3}>{session.description || "-"}</Descriptions.Item>
                    <Descriptions.Item label="Jumlah Soal">{session.questions.length}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Daftar Soal dalam Sesi Ini">
                {session.questions.length > 0 ? (
                    <QuestionList
                        questions={session.questions}
                        loading={false}
                        onView={(id) => navigate(`/questions/${id}`)}
                        // Tambahkan fungsi untuk menghapus soal dari sesi jika perlu
                    />
                ) : (
                    <Empty description="Belum ada soal dalam sesi ini. Klik 'Tambah Soal' untuk memulai." />
                )}
            </Card>

            <AddQuestionsModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                session={session}
                onQuestionsAdded={fetchSessionDetails} // Muat ulang detail setelah menambah soal
            />
        </div>
    );
};

export default TestSessionDetailPage;