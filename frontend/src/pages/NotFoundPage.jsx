// src/pages/NotFoundPage.jsx
import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Maaf, halaman yang Anda kunjungi tidak ada."
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          Kembali ke Beranda
        </Button>
      }
    />
  );
};

export default NotFoundPage;
