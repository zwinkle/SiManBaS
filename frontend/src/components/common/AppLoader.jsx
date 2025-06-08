// src/components/common/AppLoader.jsx
import React from 'react';
import { Spin } from 'antd';

/**
 * Komponen untuk menampilkan indikator loading di tengah layar.
 * Menggunakan prop `fullscreen` dari AntD untuk mode layar penuh,
 * yang secara otomatis akan memusatkan spinner dan menampilkan 'tip' dengan benar.
 */
const AppLoader = ({ tip = "Memuat..." }) => {
  // Cara paling modern dan bersih untuk loader fullscreen di AntD v5
  return <Spin tip={tip} size="large" fullscreen />;
};

export default AppLoader;