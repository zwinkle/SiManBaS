// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { App, Card, Form, Input, Button, Typography } from 'antd';
import { MailOutlined, UserOutlined, LockOutlined, IdcardOutlined } from '@ant-design/icons';
import authService from '../api/authService'; // Kita panggil service langsung
import { getApiErrorMessage } from '../utils/errors';

const { Title } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Data yang dikirim ke API tidak memerlukan 'confirm_password'
      const { confirm_password, ...userData } = values;
      await authService.register(userData);
      
      message.success('Registrasi berhasil! Silakan login dengan akun Anda.');
      navigate('/login'); // Arahkan ke halaman login setelah registrasi berhasil
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      message.error(`Registrasi gagal: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={<Title level={3} style={{ textAlign: 'center', marginBottom: 0 }}>Buat Akun Baru</Title>} style={{ width: 400 }}>
      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        layout="vertical"
        scrollToFirstError
      >
        <Form.Item
          name="full_name"
          label="Nama Lengkap"
          rules={[{ required: true, message: 'Mohon masukkan nama lengkap Anda!', whitespace: true }]}
        >
          <Input prefix={<IdcardOutlined />} placeholder="Nama Lengkap" />
        </Form.Item>
        
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Mohon masukkan username Anda!', whitespace: true }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Username" />
        </Form.Item>

        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            { type: 'email', message: 'Input bukan format e-mail yang valid!' },
            { required: true, message: 'Mohon masukkan e-mail Anda!' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="E-mail" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Mohon masukkan password Anda!' }]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <Form.Item
          name="confirm_password"
          label="Konfirmasi Password"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Mohon konfirmasi password Anda!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Password yang Anda masukkan tidak cocok!'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Konfirmasi Password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
            Daftar
          </Button>
        </Form.Item>
        
        <div style={{ textAlign: 'center' }}>
          Sudah punya akun? <Link to="/login">Login sekarang!</Link>
        </div>
      </Form>
    </Card>
  );
};

export default RegisterPage;
