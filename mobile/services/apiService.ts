import axios, { AxiosInstance, AxiosResponse } from 'axios';
import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api';
// ⚠️ For physical device, change to your LAN IP:
// const API_BASE_URL = 'http://192.168.x.x:8080/api';

class ApiService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            async (config) => {
                const token = await authService.getStoredToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor to handle token refresh
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const newToken = await authService.refreshToken();
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return this.client(originalRequest);
                    } catch (refreshError) {
                        // Refresh failed, redirect to login
                        await authService.logout();
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    // Generic HTTP methods
    async get<T>(endpoint: string, params?: object): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.client.get(endpoint, { params });
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    async post<T>(endpoint: string, data?: object): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.client.post(endpoint, data);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    async put<T>(endpoint: string, data?: object): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.client.put(endpoint, data);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    async delete<T>(endpoint: string): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.client.delete(endpoint);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    async uploadImage(file: FormData): Promise<string> {
        try {
            const response: AxiosResponse<{ url: string }> = await this.client.post(
                '/upload/image',
                file,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data.url;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    private handleError(error: any): Error {
        if (error.response) {
            // Server responded with error status
            const message = error.response.data?.message || error.response.statusText;
            return new Error(`API Error: ${message}`);
        } else if (error.request) {
            // Request was made but no response received
            return new Error('Network Error: No response from server');
        } else {
            // Something else happened
            return new Error(`Request Error: ${error.message}`);
        }
    }
}

export default new ApiService();