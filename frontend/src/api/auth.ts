import api from './axios';

export interface AuthResponse {
    accessToken: string;
    tokenType: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    email: string;
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    coverUrl?: string;
    bio?: string;
    location?: string;
    followersCount: number;
    followingCount: number;
    postsCount: number;
}

export const authApi = {
    async register(data: {
        username: string;
        email: string;
        password: string;
        displayName: string;
    }): Promise<AuthResponse> {
        const res = await api.post<AuthResponse>('/api/auth/register', data);
        return res.data;
    },

    async login(email: string, password: string): Promise<AuthResponse> {
        const res = await api.post<AuthResponse>('/api/auth/login', { email, password });
        return res.data;
    },

    async getMe(): Promise<UserProfile> {
        const res = await api.get<UserProfile>('/api/auth/me');
        return res.data;
    },

    async logout(refreshToken?: string): Promise<void> {
        await api.post('/api/auth/logout', { refreshToken: refreshToken || '' });
    },
};
