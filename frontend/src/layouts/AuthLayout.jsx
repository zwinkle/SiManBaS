// src/layouts/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

// Styling untuk container utama
const authLayoutContainerStyle = {
  display: 'flex',
  justifyContent: 'center', // Memusatkan secara horizontal
  alignItems: 'center', // Memusatkan secara vertikal
  minHeight: '100vh', // Mengisi tinggi layar penuh
  width: '100%', // Mengisi lebar layar penuh
  background: '#f0f2f5',
};

const AuthLayout = () => {
  return (
    // Kita gunakan <div> biasa untuk menghindari konflik dengan style AntD
    <div style={authLayoutContainerStyle}>
      {/* Outlet akan me-render LoginPage di sini, tepat di tengah */}
      <Outlet />
    </div>
  );
};

export default AuthLayout;