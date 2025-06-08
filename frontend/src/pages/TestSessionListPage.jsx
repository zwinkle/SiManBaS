// src/pages/TestSessionListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { List, Button, message, Skeleton, Modal, Form, Input, App, Space, Popconfirm, Alert } from 'antd'; // Impor Space & Popconfirm
import { PlusOutlined, DownloadOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined  } from '@ant-design/icons'; // Impor ikon baru
import { useNavigate } from 'react-router-dom';
import PageTitle from '../components/common/PageTitle';
import testSessionService from '../api/testSessionService';
import { getApiErrorMessage } from '../utils/errors';

const TestSessionListPage = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const navigate = useNavigate();
    const { message: messageApi } = App.useApp();

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await testSessionService.getSessions();
            setSessions(data);
        } catch (error) {
            messageApi.error(`Gagal memuat sesi ujian: ${getApiErrorMessage(error)}`);
        } finally {
            setLoading(false);
        }
    }, [messageApi]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);
    
    const handleCreateSession = async (values) => {
        try {
            const newSession = await testSessionService.createSession(values);
            messageApi.success("Sesi ujian baru berhasil dibuat.");
            setIsCreateModalOpen(false);
            createForm.resetFields();
            navigate(`/sessions/${newSession.id}`);
        } catch (error) {
            messageApi.error(`Gagal membuat sesi ujian: ${getApiErrorMessage(error)}`);
        }
    };

    const showEditModal = (session) => {
        setEditingSession(session);
        editForm.setFieldsValue({ name: session.name, description: session.description });
        setIsEditModalOpen(true);
    };

    const handleUpdateSession = async (values) => {
        if (!editingSession) return;
        try {
            await testSessionService.updateSession(editingSession.id, values);
            messageApi.success("Sesi ujian berhasil diperbarui.");
            setIsEditModalOpen(false);
            setEditingSession(null);
            fetchSessions();
        } catch (error) {
            messageApi.error(`Gagal memperbarui sesi ujian: ${getApiErrorMessage(error)}`);
        }
    };

    const handleDeleteSession = async (sessionId) => {
        try {
            await testSessionService.deleteSession(sessionId);
            messageApi.success("Sesi ujian berhasil dihapus.");
            fetchSessions(); // Muat ulang daftar sesi
        } catch (error) {
            messageApi.error(`Gagal menghapus sesi ujian: ${getApiErrorMessage(error)}`);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <PageTitle title="Sesi Ujian" />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>Buat Sesi Baru</Button>
            </div>
            
            <Alert
                message="Praktik Terbaik untuk Sesi Ujian"
                description={
                    <div>
                        <p><strong>Buat satu sesi per mata pelajaran</strong> untuk ujian reguler (seperti UTS atau UAS) agar hasil analisis, terutama Indeks Diskriminasi, menjadi akurat.</p>
                        <p><strong>Gabungkan beberapa mata pelajaran</strong> hanya untuk ujian komprehensif seperti Try Out atau Tes Pengetahuan Umum.</p>
                    </div>
                }
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                style={{ marginBottom: 24 }}
            />

            <List
                loading={loading}
                itemLayout="horizontal"
                dataSource={sessions}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Button type="link" icon={<DownloadOutlined />} onClick={() => testSessionService.downloadAnswerSheet(item.id)}>Template</Button>,
                            <a onClick={() => navigate(`/sessions/${item.id}`)}>Kelola</a>,
                            <Button type="link" icon={<EditOutlined />} onClick={() => showEditModal(item)}>Edit</Button>,
                            <Popconfirm
                                title="Hapus Sesi Ujian"
                                description="Apakah Anda yakin? Semua data terkait akan hilang."
                                onConfirm={() => handleDeleteSession(item.id)}
                                okText="Ya, Hapus"
                                cancelText="Batal"
                            >
                                <Button type="link" danger icon={<DeleteOutlined />}>Hapus</Button>
                            </Popconfirm>
                        ]}
                    >
                        <List.Item.Meta
                            title={<a onClick={() => navigate(`/sessions/${item.id}`)}>{item.name}</a>}
                            description={item.description || "Tidak ada deskripsi"}
                        />
                        <div>{item.questions?.length || 0} Soal</div>
                    </List.Item>
                )}
            />

            <Modal title="Buat Sesi Ujian Baru" open={isCreateModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} okText="Buat">
                <Form form={createForm} layout="vertical" onFinish={handleCreateSession}>
                    <Form.Item name="name" label="Nama Sesi Ujian" rules={[{ required: true, message: 'Nama sesi tidak boleh kosong' }]}>
                        <Input placeholder="Contoh: UTS Ganjil 2025 - Matematika" />
                    </Form.Item>
                    <Form.Item name="description" label="Deskripsi">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title="Edit Sesi Ujian" open={isEditModalOpen} onCancel={() => setIsEditModalOpen(false)} onOk={() => editForm.submit()} okText="Simpan Perubahan">
                <Form form={editForm} layout="vertical" onFinish={handleUpdateSession}>
                    <Form.Item name="name" label="Nama Sesi Ujian" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Deskripsi">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TestSessionListPage;