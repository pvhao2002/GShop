import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Base URL for the backend API
const BASE_URL = __DEV__ 
  ? 'http://localhost:8080/api' 
  : 'https://your-production-api.com/api';

// Create axios instance
export const apiService = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiService.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear stored auth
      try {
        await SecureStore.deleteItemAsync('admin_token');
        await SecureStore.deleteItemAsync('admin_user');
      } catch (clearError) {
        console.error('Error clearing auth:', clearError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiService;