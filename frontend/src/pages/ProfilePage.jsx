// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Avatar, Spin, Typography } from 'antd';
import { UserOutlined, MailOutlined, IdcardOutlined, LockOutlined } from '@ant-design/icons';
import useAuth from '../hooks/useAuth';
import PageTitle from '../components/common/PageTitle';
import { getApiErrorMessage } from '../utils/errors';
import authService from '../api/authService';

const { Text, Title } = Typography;

const ProfilePage = () => {
    // Dapatkan 'user', status loading awal, dan fungsi 'refreshUser' dari context
    const { user, loading: authLoading, refreshUser } = useAuth();
    // State untuk loading saat form disubmit
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    // Gunakan useEffect untuk mengisi ulang form jika data user dari context berubah.
    // Ini memastikan form menampilkan data terbaru setelah pembaruan.
    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                full_name: user.full_name,
                username: user.username,
                email: user.email,
            });
        }
    }, [user, form]);

    /**
     * Fungsi yang dijalankan saat form disubmit.
     * @param {object} values - Nilai-nilai dari form.
     */
    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            // Buat payload bersih: jangan kirim field password jika kosong
            const payload = { ...values };
            if (!payload.password || payload.password.trim() === '') {
                delete payload.password;
            }
            
            // Panggil fungsi API untuk update user me
            await authService.updateMyProfile(payload);
            
            // Muat ulang data user di seluruh aplikasi untuk merefleksikan perubahan
            await refreshUser();
            
            message.success('Profil berhasil diperbarui!');
        } catch (error) {
            message.error(getApiErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    // Tampilkan loader besar jika data profil awal masih dimuat
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
                    <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>{user?.full_name}</Title>
                    <Text type="secondary">@{user?.username}</Text>
                </div>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={user} // Mengisi form dengan data user saat ini
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
