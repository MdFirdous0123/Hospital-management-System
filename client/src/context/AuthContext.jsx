import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('hms_token');
        const savedUser = localStorage.getItem('hms_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData, tokenValue) => {
        setUser(userData); setToken(tokenValue);
        localStorage.setItem('hms_token', tokenValue);
        localStorage.setItem('hms_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null); setToken(null);
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}
