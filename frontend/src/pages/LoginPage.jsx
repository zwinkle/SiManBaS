// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { App, Card, Form, Input, Button, Checkbox, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import useAuth from '../hooks/useAuth';
import { getApiErrorMessage } from '../utils/errors';

const { Title } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  // Arahkan pengguna ke halaman asal mereka sebelum diarahkan ke login, atau ke dashboard
  const from = location.state?.from?.pathname || "/";

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await auth.login(values.username, values.password);
      message.success('Login berhasil!');
      // Arahkan ke halaman yang dituju setelah login berhasil
      navigate(from, { replace: true });
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      message.error(`Login gagal: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={<Title level={3} style={{ textAlign: 'center', marginBottom: 0 }}>Login SiManBaS</Title>} style={{ width: 400 }}>
      <Form
        name="normal_login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Mohon masukkan Username Anda!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Mohon masukkan Password Anda!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Ingat saya</Checkbox>
          </Form.Item>
          <a style={{ float: 'right' }} href="">Lupa password</a>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
            Log in
          </Button>
        </Form.Item>
        
        <div style={{ textAlign: 'center' }}>
          Atau <Link to="/register">daftar sekarang!</Link>
        </div>
      </Form>
    </Card>
  );
};

export default LoginPage;
