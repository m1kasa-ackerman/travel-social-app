import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('wandrly_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 globally — clear token and redirect to login
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('wandrly_token');
            localStorage.removeItem('wandrly_user');
            window.location.href = '/login';
        }
        if (error.response?.status === 429) {
            console.warn('Rate limit hit — slow down requests');
        }
        return Promise.reject(error);
    }
);

export default api;
