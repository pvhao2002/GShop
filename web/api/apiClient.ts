// app/api/apiClient.ts
import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default apiClient;
