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
  SolutionOutlined,
  CheckSquareOutlined,
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

    const userMenuItems = [
        { key: 'profile', label: 'Profil Saya', icon: <UserOutlined />, onClick: () => navigate('/profile') },
        { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
    ];

    const menuItems = useMemo(() => {
        const items = [
            getItem(<Link to="/">Dashboard</Link>, '/', <PieChartOutlined />),
            getItem(<Link to="/rosters">Kelas Saya</Link>, '/rosters', <TeamOutlined />), // Menu Daftar Kelas
            getItem(<Link to="/sessions">Sesi Ujian</Link>, '/sessions', <SolutionOutlined />),
            getItem(<Link to="/questions">Bank Soal</Link>, '/questions', <FileTextOutlined />),
            getItem(<Link to="/grading">Penilaian Manual</Link>, '/grading', <CheckSquareOutlined />), // Menu Penilaian Manual
            getItem(<Link to="/analysis/summary">Analisis</Link>, '/analysis/summary', <DesktopOutlined />),
        ];

        if (user?.role === 'admin') {
            items.push(getItem(<Link to="/users">Manajemen Pengguna</Link>, '/users', <TeamOutlined />));
        }

        return items;
    }, [user?.role]);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
                <Menu theme="dark" selectedKeys={[location.pathname]} mode="inline" items={menuItems} />
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
                <Footer style={{ textAlign: 'center' }}>SiManBaS ©{new Date().getFullYear()}</Footer>
            </Layout>
        </Layout>
    );
};

export default MainLayout;