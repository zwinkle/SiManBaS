// src/contexts/AuthContext.js
import { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        if (token) {
            // Pasang token ke header Axios untuk request ini
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const response = await apiClient.get('/users/me');
                setUser(response.data);
            } catch (error) {
                console.error("Token tidak valid atau sesi berakhir:", error);
                localStorage.removeItem('accessToken');
                setToken(null);
                setUser(null);
                delete apiClient.defaults.headers.common['Authorization'];
            }
        }
        setLoading(false);
    }, [token]);

    const refreshUser = useCallback(async () => {
        if (token) {
            try {
                const response = await apiClient.get('/users/me');
                setUser(response.data);
            } catch (error) {
                console.error("Gagal memuat ulang data pengguna:", error);
            }
        }
    }, [token]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (username, password) => {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        const response = await apiClient.post('/auth/login', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token } = response.data;
        localStorage.setItem('accessToken', access_token);
        setToken(access_token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        const userResponse = await apiClient.get('/users/me');
        setUser(userResponse.data);
        // -----------------------
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setToken(null);
        setUser(null);
        delete apiClient.defaults.headers.common['Authorization'];
    };

    const authContextValue = {
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
