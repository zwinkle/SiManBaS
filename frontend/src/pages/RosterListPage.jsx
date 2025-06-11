// src/pages/RosterListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { List, Button, Skeleton, Modal, Form, Input, App, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../components/common/PageTitle';
import rosterService from '../api/rosterService';
import { getApiErrorMessage } from '../utils/errors';

const RosterListPage = () => {
    const [rosters, setRosters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoster, setEditingRoster] = useState(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { message: messageApi } = App.useApp();

    const fetchRosters = useCallback(async () => {
        setLoading(true);
        try {
            const data = await rosterService.getRosters();
            setRosters(data);
        } catch (error) {
            messageApi.error(`Gagal memuat daftar kelas: ${getApiErrorMessage(error)}`);
        } finally {
            setLoading(false);
        }
    }, [messageApi]);

    useEffect(() => {
        fetchRosters();
    }, [fetchRosters]);

    const handleFormSubmit = async (values) => {
        try {
            if (editingRoster) {
                await rosterService.updateRoster(editingRoster.id, values);
                messageApi.success("Kelas berhasil diperbarui.");
            } else {
                await rosterService.createRoster(values);
                messageApi.success("Kelas baru berhasil dibuat.");
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingRoster(null);
            fetchRosters();
        } catch (error) {
            messageApi.error(`Gagal menyimpan kelas: ${getApiErrorMessage(error)}`);
        }
    };

    const showModal = (roster = null) => {
        setEditingRoster(roster);
        form.setFieldsValue(roster ? { name: roster.name, description: roster.description } : { name: '', description: '' });
        setIsModalOpen(true);
    };

    const handleDelete = async (rosterId) => {
        try {
            await rosterService.deleteRoster(rosterId);
            messageApi.success("Kelas berhasil dihapus.");
            fetchRosters();
        } catch (error) {
            messageApi.error(`Gagal menghapus kelas: ${getApiErrorMessage(error)}`);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <PageTitle title="Kelas Saya" />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Buat Kelas Baru</Button>
            </div>
            <List
                loading={loading}
                itemLayout="horizontal"
                dataSource={rosters}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <a onClick={() => navigate(`/rosters/${item.id}`)}>Kelola Siswa</a>,
                            <Button type="text" icon={<EditOutlined />} onClick={() => showModal(item)} />,
                            <Popconfirm title="Hapus Kelas?" onConfirm={() => handleDelete(item.id)} okText="Ya">
                                <Button type="text" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        ]}
                    >
                        <Skeleton avatar title={false} loading={false} active>
                            <List.Item.Meta
                                title={<a onClick={() => navigate(`/rosters/${item.id}`)}>{item.name}</a>}
                                description={item.description || "Tidak ada deskripsi"}
                            />
                            <div>{item.students?.length || 0} Siswa</div>
                        </Skeleton>
                    </List.Item>
                )}
            />
            <Modal title={editingRoster ? "Edit Kelas" : "Buat Kelas Baru"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} okText="Simpan" destroyOnClose>
                <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                    <Form.Item name="name" label="Nama Kelas" rules={[{ required: true, message: 'Nama kelas tidak boleh kosong' }]}>
                        <Input placeholder="Contoh: XII IPA 1 - 2025/2026" />
                    </Form.Item>
                    <Form.Item name="description" label="Deskripsi">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RosterListPage;