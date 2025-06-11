// src/pages/RosterDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Card, Spin, message, Button, Table, Modal, Upload, Divider, Typography } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import PageTitle from '../components/common/PageTitle';
import rosterService from '../api/rosterService';
import { getApiErrorMessage } from '../utils/errors';

const { Dragger } = Upload;
const { Paragraph } = Typography;

const RosterDetailPage = () => {
    const { id: rosterId } = useParams();
    const [roster, setRoster] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const fetchRosterDetails = useCallback(async () => {
        setLoading(true);
        try {
            const data = await rosterService.getRosterDetails(rosterId);
            setRoster(data);
        } catch (error) {
            message.error(`Gagal memuat detail kelas: ${getApiErrorMessage(error)}`);
        } finally {
            setLoading(false);
        }
    }, [rosterId]);

    useEffect(() => {
        fetchRosterDetails();
    }, [fetchRosterDetails]);

    const handleUpload = async (options) => {
        const { file, onSuccess, onError } = options;
        try {
            await rosterService.uploadStudentList(rosterId, file);
            onSuccess("Ok");
            message.success(`${file.name} berhasil diunggah dan daftar siswa diperbarui.`);
            fetchRosterDetails(); // Muat ulang detail
        } catch (error) {
            onError(error);
            message.error(`Gagal mengunggah daftar siswa: ${getApiErrorMessage(error)}`);
        }
    };
    
    const studentColumns = [
        { title: 'ID Siswa', dataIndex: 'student_identifier', key: 'student_identifier' },
    ];

    if (loading) return <Spin size="large" fullscreen />;
    if (!roster) return <PageTitle title="Kelas Tidak Ditemukan" />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <PageTitle title={`Detail Kelas: ${roster.name}`} />
                <Space>
                    <Button icon={<DownloadOutlined />} onClick={() => rosterService.downloadRosterTemplate()}>Unduh Template Siswa</Button>
                    <Button type="primary" icon={<UploadOutlined />} onClick={() => setIsUploadModalOpen(true)}>Upload Daftar Siswa</Button>
                </Space>
            </div>
            <Card style={{ marginBottom: 24 }}>
                <Descriptions bordered>
                    <Descriptions.Item label="Deskripsi" span={3}>{roster.description || "-"}</Descriptions.Item>
                    <Descriptions.Item label="Jumlah Siswa">{roster.students.length}</Descriptions.Item>
                </Descriptions>
            </Card>
            <Card title="Daftar Siswa">
                <Table
                    columns={studentColumns}
                    dataSource={roster.students}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Upload Daftar Siswa (CSV)"
                open={isUploadModalOpen}
                onCancel={() => setIsUploadModalOpen(false)}
                footer={null}
            >
                <Paragraph>Unggah file CSV dengan satu kolom header bernama `student_identifier`.</Paragraph>
                <Dragger customRequest={handleUpload} showUploadList={false} accept=".csv">
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="ant-upload-text">Klik atau seret file ke area ini</p>
                </Dragger>
            </Modal>
        </div>
    );
};

export default RosterDetailPage;