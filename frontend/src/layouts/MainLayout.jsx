// src/layouts/MainLayout.jsx
import React, { useState, useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  DesktopOutlined,
  FileTextOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Layout, Menu, theme, Space, Avatar, Dropdown } from 'antd';
import useAuth from '../hooks/useAuth';

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menu untuk dropdown profil pengguna
  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profil Saya',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'), // Navigasi ke halaman profil
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Membuat menu sidebar dinamis berdasarkan peran pengguna
  const menuItems = useMemo(() => {
    const baseItems = [
      getItem(<Link to="/">Dashboard</Link>, '/', <PieChartOutlined />),
      getItem(<Link to="/questions">Bank Soal</Link>, '/questions', <FileTextOutlined />),
      getItem(<Link to="/analysis/summary">Analisis</Link>, '/analysis/summary', <DesktopOutlined />),
    ];

    // Tambahkan menu "Manajemen Pengguna" hanya jika peran adalah 'admin'
    if (user?.role === 'admin') {
      baseItems.push(getItem(<Link to="/users">Manajemen Pengguna</Link>, '/users', <TeamOutlined />));
    }

    return baseItems;
  }, [user?.role]); // Menu akan dibuat ulang hanya jika peran pengguna berubah

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
              <a onClick={(e) => e.preventDefault()}>
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} />
                  <span>{user ? user.full_name || user.username : 'Pengguna'}</span>
                </Space>
              </a>
            </Dropdown>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          SiManBaS ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
