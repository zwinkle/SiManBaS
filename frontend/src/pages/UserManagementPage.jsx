// src/pages/UserManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Switch, message, Tooltip, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import PageTitle from '../components/common/PageTitle';
import { getApiErrorMessage } from '../utils/errors';
import userService from '../api/userService';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (error) {
            message.error(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    /**
     * Menangani perubahan status aktif/nonaktif pengguna.
     * Menerapkan 'Optimistic UI Update' untuk responsivitas.
     * @param {string} userId - ID pengguna yang diubah.
     * @param {boolean} newStatus - Status baru (true untuk aktif, false untuk nonaktif).
     */
    const handleStatusChange = async (userId, newStatus) => {
        // Simpan state asli jika pembaruan API gagal
        const originalUsers = [...users];
        
        // Perbarui UI secara langsung untuk memberikan kesan instan
        const updatedUsers = users.map(user => 
            user.id === userId ? { ...user, is_active: newStatus } : user
        );
        setUsers(updatedUsers);

        try {
            // Panggil API untuk update status user di backend
            await userService.updateUser(userId, { is_active: newStatus });
            message.success(`Status pengguna berhasil diperbarui.`);
            // Tidak perlu fetch ulang karena UI sudah diupdate secara optimis
        } catch (error) {
            // Jika gagal, kembalikan state ke semula dan tampilkan pesan error
            setUsers(originalUsers);
            message.error(getApiErrorMessage(error));
        }
    };

    const columns = [
        {
            title: 'Nama Lengkap',
            dataIndex: 'full_name',
            key: 'full_name',
            sorter: (a, b) => (a.full_name || '').localeCompare(b.full_name || ''),
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Peran',
            dataIndex: 'role',
            key: 'role',
            render: role => <Tag color={role === 'admin' ? 'volcano' : 'geekblue'}>{role.toUpperCase()}</Tag>,
            filters: [
                { text: 'Admin', value: 'admin' },
                { text: 'Teacher', value: 'teacher' },
            ],
            onFilter: (value, record) => record.role.indexOf(value) === 0,
        },
        {
            title: 'Status Aktif',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive, record) => (
                <Tooltip title={isActive ? "Nonaktifkan pengguna ini" : "Aktifkan pengguna ini"}>
                    <Switch
                        checked={isActive}
                        onChange={(checked) => handleStatusChange(record.id, checked)}
                        checkedChildren="Aktif"
                        unCheckedChildren="Nonaktif"
                    />
                </Tooltip>
            ),
             filters: [
                { text: 'Aktif', value: true },
                { text: 'Nonaktif', value: false },
            ],
            onFilter: (value, record) => record.is_active === value,
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_, record) => (
                <Tooltip title={`Lihat riwayat jawaban untuk ${record.username}`}>
                    <Button 
                        type="text" 
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/students/${record.username}`)} // Gunakan username sebagai identifier
                    />
                </Tooltip>
            )
        }
    ];

    return (
        <div>
            <PageTitle title="Manajemen Pengguna" />
            <Table
                columns={columns}
                dataSource={users}
                loading={loading}
                rowKey="id"
                scroll={{ x: true }}
            />
        </div>
    );
};

export default UserManagementPage;
