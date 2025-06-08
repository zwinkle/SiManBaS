// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Spin, Typography, App } from 'antd';
import { UserOutlined, MailOutlined, IdcardOutlined, LockOutlined } from '@ant-design/icons';
import useAuth from '../hooks/useAuth';
import PageTitle from '../components/common/PageTitle';
import { getApiErrorMessage } from '../utils/errors';
import authService from '../api/authService';

const { Text } = Typography;

const ProfilePage = () => {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const { message: messageApi } = App.useApp();

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                full_name: user.full_name,
                username: user.username,
                email: user.email,
            });
        }
    }, [user, form]);

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            // --- PERBAIKAN DI SINI ---
            // 1. Buat objek payload yang bersih secara eksplisit.
            // Ini untuk memastikan hanya field yang diizinkan oleh API yang dikirim.
            const payload = {
                full_name: values.full_name,
                email: values.email,
            };

            // 2. Hanya tambahkan field 'password' ke payload jika pengguna benar-benar mengisinya.
            if (values.password && values.password.trim() !== '') {
                payload.password = values.password;
            }
            // `username` dan field lain dari form tidak akan disertakan.
            // --- AKHIR PERBAIKAN ---

            // 4. Kirim payload yang bersih ke API.
            await authService.updateMyProfile(payload);
            
            await refreshUser();
            
            messageApi.success('Profil berhasil diperbarui!');
        } catch (error) {
            messageApi.error(getApiErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spin tip="Memuat profil..." size="large" />
            </div>
        );
    }

    return (
        <div>
            <PageTitle title="Profil Saya" />
            <Card>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Avatar size={128} icon={<UserOutlined />} />
                    <Typography.Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>{user?.full_name}</Typography.Title>
                    <Text type="secondary">@{user?.username}</Text>
                </div>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={user}
                    style={{ maxWidth: '600px', margin: '0 auto' }}
                >
                    <Form.Item name="full_name" label="Nama Lengkap" rules={[{ required: true, message: 'Nama lengkap tidak boleh kosong' }]}>
                        <Input prefix={<IdcardOutlined />} placeholder="Nama Lengkap Anda" />
                    </Form.Item>
                    <Form.Item name="username" label="Username">
                        <Input prefix={<UserOutlined />} disabled />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Email tidak boleh kosong' }, { type: 'email', message: 'Format email tidak valid'}]}>
                        <Input prefix={<MailOutlined />} type="email" placeholder="Email Anda" />
                    </Form.Item>
                    <Form.Item 
                        name="password" 
                        label="Password Baru"
                        help="Kosongkan field ini jika Anda tidak ingin mengubah password."
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Masukkan password baru" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={submitting}>
                            Simpan Perubahan
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ProfilePage;
