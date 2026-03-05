import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { UserProfile } from '../api/auth';

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        username: string;
        email: string;
        password: string;
        displayName: string;
    }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // On mount: restore session from localStorage
    useEffect(() => {
        const token = localStorage.getItem('wandrly_token');
        if (token) {
            authApi.getMe()
                .then(profile => setUser(profile))
                .catch(() => {
                    // Token invalid/expired — clear it
                    localStorage.removeItem('wandrly_token');
                    localStorage.removeItem('wandrly_user');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    async function login(email: string, password: string) {
        const response = await authApi.login(email, password);
        localStorage.setItem('wandrly_token', response.accessToken);
        const profile = await authApi.getMe();
        localStorage.setItem('wandrly_user', JSON.stringify(profile));
        setUser(profile);
    }

    async function register(data: {
        username: string;
        email: string;
        password: string;
        displayName: string;
    }) {
        const response = await authApi.register(data);
        localStorage.setItem('wandrly_token', response.accessToken);
        const profile = await authApi.getMe();
        localStorage.setItem('wandrly_user', JSON.stringify(profile));
        setUser(profile);
    }

    function logout() {
        localStorage.removeItem('wandrly_token');
        localStorage.removeItem('wandrly_user');
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
