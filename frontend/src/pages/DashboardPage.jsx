// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import PageTitle from '../components/common/PageTitle';
import StatCard from '../components/dashboard/StatCard';
import { Row, Col, Card, List, Typography, Tag, message, Skeleton } from 'antd';
import { FileTextOutlined, TeamOutlined, BarChartOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import statisticsService from '../api/statisticsService';
import { getApiErrorMessage } from '../utils/errors';

const { Text, Link } = Typography;

// --- Komponen Dashboard untuk Admin ---
const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await statisticsService.getAdminDashboardStats();
                setStats(data);
            } catch (error) {
                message.error(`Gagal memuat statistik admin: ${getApiErrorMessage(error)}`);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <Skeleton active paragraph={{ rows: 8 }} />;
    }

    return (
        <div>
            <PageTitle title="Dashboard Administrator" />
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                    <StatCard title="Total Soal" value={stats?.total_questions || 0} icon={<FileTextOutlined />} />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <StatCard title="Total Pengguna" value={stats?.total_users || 0} icon={<TeamOutlined />} />
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} md={12}>
                    <Card title="Aktivitas Terbaru (5 Soal Terakhir)">
                        <List
                            itemLayout="horizontal"
                            dataSource={stats?.recent_questions || []}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<Link onClick={() => navigate(`/questions/${item.id}`)}>{item.content.substring(0, 50)}...</Link>}
                                        description={`Dibuat oleh: ${item.creator.username} - Tipe: ${item.question_type.replace('_', ' ')}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Soal Perlu Direview (D-Index Terendah)">
                         <List
                            itemLayout="horizontal"
                            dataSource={stats?.worst_questions || []}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<WarningOutlined style={{ color: '#faad14', fontSize: '24px' }} />}
                                        title={<Link onClick={() => navigate(`/questions/${item.question.id}`)}>{item.question.content.substring(0, 50)}...</Link>}
                                        description={<Text type="danger">D-Index: {(item.discrimination_index || 0).toFixed(3)}</Text>}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

// --- Komponen Dashboard untuk Guru/Pengajar ---
const TeacherDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await statisticsService.getTeacherDashboardStats();
                setStats(data);
            } catch (error) {
                message.error(`Gagal memuat statistik pengajar: ${getApiErrorMessage(error)}`);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);
    
    if (loading) {
        return <Skeleton active paragraph={{ rows: 4 }} />;
    }

    return (
        <div>
            <PageTitle title={`Selamat Datang, ${user?.full_name || user?.username}!`} />
            <Text>Berikut adalah ringkasan aktivitas bank soal Anda.</Text>
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} sm={12} md={8}>
                    <StatCard title="Total Soal Anda" value={stats?.total_questions_created || 0} icon={<FileTextOutlined />} />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <StatCard title="Rata-rata P-Value Soal Anda" value={stats?.average_p_value || 0} precision={3} icon={<CheckCircleOutlined />} />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <StatCard title="Rata-rata D-Index Soal Anda" value={stats?.average_d_index || 0} precision={3} icon={<BarChartOutlined />} />
                </Col>
            </Row>
        </div>
    );
};

// --- Komponen Dashboard Utama ---
const DashboardPage = () => {
    const { user, loading } = useAuth();

    if (loading || !user) {
        // Tampilkan skeleton loader saat data user awal masih dimuat
        return <Skeleton active paragraph={{ rows: 4 }} />;
    }

    // Tampilkan dashboard yang sesuai berdasarkan peran pengguna
    return user.role === 'admin' ? <AdminDashboard /> : <TeacherDashboard />;
};

export default DashboardPage;
