// src/hooks/useAuth.js
import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

/**
 * Custom hook untuk mengakses AuthContext.
 * Ini adalah cara yang lebih bersih daripada mengimpor useContext dan AuthContext
 * di setiap komponen yang membutuhkannya.
 *
 * @returns {{
 * user: object | null,
 * token: string | null,
 * loading: boolean,
 * login: (username, password) => Promise<void>,
 * logout: () => void
 * }}
 */
const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default useAuth;