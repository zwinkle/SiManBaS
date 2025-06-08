// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ConfigProvider, App as AntdApp } from 'antd';
import idID from 'antd/locale/id_ID'; // Import locale Bahasa Indonesia untuk AntD
import './index.css'; // Import file CSS global kita

import '@ant-design/v5-patch-for-react-19';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AuthProvider membungkus seluruh aplikasi agar state autentikasi tersedia di mana saja */}
    <AuthProvider>
      {/* ConfigProvider dari AntD untuk mengatur tema global dan lokalisasi */}
      <ConfigProvider
        locale={idID} // Mengatur bahasa komponen AntD menjadi Indonesia
        theme={{
          token: {
            // Contoh kustomisasi tema
            colorPrimary: '#00B96B', // Warna hijau
            borderRadius: 6,
          },
          components: {
            Button: {
              // Contoh kustomisasi komponen spesifik
              // primaryShadow: '0 2px 0 rgba(0, 185, 107, 0.3)',
            },
          },
        }}
      >
        <AntdApp>
          <App />
        </AntdApp>
      </ConfigProvider>
    </AuthProvider>
  </React.StrictMode>,
);
