import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { APP_CONFIG } from '../config/app';

// Create axios instance
const api = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshResponse = await axios.post(`${APP_CONFIG.API_BASE_URL}/auth/refresh`, {}, {
          headers: {
            Authorization: originalRequest.headers.Authorization,
          },
        });

        const { token } = refreshResponse.data;
        await SecureStore.setItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);

        // Update the authorization header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear token and redirect to login
        await SecureStore.deleteItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        // The AuthProvider will handle the logout action
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;