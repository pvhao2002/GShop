import axios, { AxiosInstance, AxiosResponse } from 'axios';
import authService from './authService';
import { networkHandler, withNetworkRetry } from '../utils/networkHandler';

const API_BASE_URL = 'http://localhost:8080/api';
// ⚠️ For physical device, change to your LAN IP:
// const API_BASE_URL = 'http://192.168.x.x:8080/api';

// Extend Axios config to include custom properties
declare module 'axios' {
    interface InternalAxiosRequestConfig {
        skipAuth?: boolean;
        metadata?: {
            requestId: string;
        };
        _retry?: boolean;
    }
}

export interface ApiError {
    message: string;
    status?: number;
    code?: string;
    details?: any;
    isNetworkError: boolean;
    isRetryable: boolean;
}

export interface RequestConfig {
    retries?: number;
    timeout?: number;
    skipAuth?: boolean;
    skipRetry?: boolean;
}

class ApiService {
    private client: AxiosInstance;
    private requestQueue: Map<string, Promise<any>> = new Map();

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
        // Request interceptor to add auth token and handle network state
        this.client.interceptors.request.use(
            async (config) => {
                // Check network connectivity
                if (!networkHandler.isOnline()) {
                    throw new Error('No internet connection');
                }

                // Add auth token if not skipped
                if (!config.skipAuth) {
                    const token = await authService.getStoredToken();
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }

                // Add request ID for deduplication
                const requestId = this.generateRequestId(config);
                config.metadata = { requestId };

                return config;
            },
            (error) => {
                return Promise.reject(this.createApiError(error));
            }
        );

        // Response interceptor to handle token refresh and errors
        this.client.interceptors.response.use(
            (response) => {
                // Remove from request queue on success
                const requestId = response.config.metadata?.requestId;
                if (requestId) {
                    this.requestQueue.delete(requestId);
                }
                return response;
            },
            async (error) => {
                const originalRequest = error.config;
                const requestId = originalRequest.metadata?.requestId;

                // Remove from request queue
                if (requestId) {
                    this.requestQueue.delete(requestId);
                }

                // Handle 401 unauthorized - token refresh
                if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.skipAuth) {
                    originalRequest._retry = true;

                    try {
                        const newToken = await authService.refreshToken();
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return this.client(originalRequest);
                    } catch (refreshError) {
                        // Refresh failed, redirect to login
                        await authService.logout();
                        return Promise.reject(this.createApiError(refreshError));
                    }
                }

                // Handle rate limiting
                if (error.response?.status === 429) {
                    const retryAfter = error.response.headers['retry-after'];
                    if (retryAfter) {
                        const delay = parseInt(retryAfter) * 1000;
                        await this.delay(delay);
                        return this.client(originalRequest);
                    }
                }

                return Promise.reject(this.createApiError(error));
            }
        );
    }

    // Generic HTTP methods with enhanced error handling
    async get<T>(endpoint: string, params?: object, config?: RequestConfig): Promise<T> {
        const operation = async () => {
            const response: AxiosResponse<T> = await this.client.get(endpoint, {
                params,
                ...this.buildAxiosConfig(config)
            });
            return response.data;
        };

        return this.executeWithRetry(operation, endpoint, 'GET', config);
    }

    async post<T>(endpoint: string, data?: object, config?: RequestConfig): Promise<T> {
        const operation = async () => {
            const response: AxiosResponse<T> = await this.client.post(endpoint, data, this.buildAxiosConfig(config));
            return response.data;
        };

        return this.executeWithRetry(operation, endpoint, 'POST', config);
    }

    async put<T>(endpoint: string, data?: object, config?: RequestConfig): Promise<T> {
        const operation = async () => {
            const response: AxiosResponse<T> = await this.client.put(endpoint, data, this.buildAxiosConfig(config));
            return response.data;
        };

        return this.executeWithRetry(operation, endpoint, 'PUT', config);
    }

    async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        const operation = async () => {
            const response: AxiosResponse<T> = await this.client.delete(endpoint, this.buildAxiosConfig(config));
            return response.data;
        };

        return this.executeWithRetry(operation, endpoint, 'DELETE', config);
    }

    async uploadImage(file: FormData, config?: RequestConfig): Promise<string> {
        const operation = async () => {
            const response: AxiosResponse<{ url: string }> = await this.client.post(
                '/upload/image',
                file,
                {
                    ...this.buildAxiosConfig(config),
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 30000, // Longer timeout for file uploads
                }
            );
            return response.data.url;
        };

        return this.executeWithRetry(operation, '/upload/image', 'POST', config);
    }

    // Helper methods
    private async executeWithRetry<T>(
        operation: () => Promise<T>,
        endpoint: string,
        method: string,
        config?: RequestConfig
    ): Promise<T> {
        const requestKey = `${method}:${endpoint}`;

        // Check if same request is already in progress (deduplication)
        if (this.requestQueue.has(requestKey)) {
            return this.requestQueue.get(requestKey);
        }

        const executeOperation = async (): Promise<T> => {
            try {
                if (config?.skipRetry) {
                    return await operation();
                }

                return await withNetworkRetry(
                    operation,
                    {
                        maxRetries: config?.retries ?? 3,
                        baseDelay: 1000,
                        maxDelay: 10000,
                        backoffFactor: 2,
                    },
                    requestKey
                );
            } finally {
                this.requestQueue.delete(requestKey);
            }
        };

        const promise = executeOperation();
        this.requestQueue.set(requestKey, promise);

        return promise;
    }

    private buildAxiosConfig(config?: RequestConfig): any {
        return {
            timeout: config?.timeout,
            skipAuth: config?.skipAuth,
        };
    }

    private generateRequestId(config: any): string {
        const method = config.method?.toUpperCase() || 'GET';
        const url = config.url || '';
        const timestamp = Date.now();
        return `${method}:${url}:${timestamp}`;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private createApiError(error: any): ApiError {
        let apiError: ApiError = {
            message: 'Unknown error occurred',
            isNetworkError: false,
            isRetryable: false,
        };

        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const data = error.response.data;

            apiError = {
                message: data?.message || error.response.statusText || `HTTP ${status} Error`,
                status,
                code: data?.code,
                details: data?.details,
                isNetworkError: false,
                isRetryable: this.isRetryableStatus(status),
            };
        } else if (error.request) {
            // Request was made but no response received
            apiError = {
                message: 'Network error: Unable to reach server',
                isNetworkError: true,
                isRetryable: true,
            };
        } else if (error.message) {
            // Something else happened
            const isNetworkError = this.isNetworkErrorMessage(error.message);
            apiError = {
                message: error.message,
                isNetworkError,
                isRetryable: isNetworkError,
            };
        }

        return apiError;
    }

    private isRetryableStatus(status: number): boolean {
        // Retry on server errors and rate limiting
        return status >= 500 || status === 429 || status === 408;
    }

    private isNetworkErrorMessage(message: string): boolean {
        const networkErrorKeywords = [
            'network',
            'connection',
            'timeout',
            'internet',
            'offline',
            'unreachable',
        ];

        const lowerMessage = message.toLowerCase();
        return networkErrorKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    // Public utility methods
    public clearRequestQueue(): void {
        this.requestQueue.clear();
    }

    public getQueueSize(): number {
        return this.requestQueue.size;
    }

    public isRequestInProgress(endpoint: string, method: string = 'GET'): boolean {
        return this.requestQueue.has(`${method}:${endpoint}`);
    }
}

export default new ApiService();