import api from './api';
import * as SecureStore from 'expo-secure-store';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
  };
  token: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    const { token } = response.data;
    
    // Store token securely
    await SecureStore.setItemAsync('authToken', token);
    
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData);
    const { token } = response.data;
    
    // Store token securely
    await SecureStore.setItemAsync('authToken', token);
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      // Call logout API to invalidate token on server
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Always remove token from secure storage
      await SecureStore.deleteItemAsync('authToken');
      
      // Clear any other stored auth-related data
      try {
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('userPreferences');
      } catch (error) {
        console.error('Error clearing additional auth data:', error);
      }
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const response = await api.post('/auth/refresh');
      const { token } = response.data;
      
      await SecureStore.setItemAsync('authToken', token);
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await SecureStore.deleteItemAsync('authToken');
      return null;
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  async validateToken(): Promise<AuthResponse | null> {
    try {
      const token = await this.getStoredToken();
      if (!token) return null;

      const response = await api.get('/auth/me');
      return {
        user: response.data.user,
        token,
      };
    } catch (error) {
      console.error('Token validation failed:', error);
      await SecureStore.deleteItemAsync('authToken');
      return null;
    }
  }

  async initializeAuth(): Promise<AuthResponse | null> {
    try {
      const token = await this.getStoredToken();
      if (!token) return null;

      // Try to validate current token
      const validationResult = await this.validateToken();
      if (validationResult) {
        return validationResult;
      }

      // If validation fails, try to refresh token
      const newToken = await this.refreshToken();
      if (newToken) {
        const response = await api.get('/auth/me');
        return {
          user: response.data.user,
          token: newToken,
        };
      }

      return null;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      await SecureStore.deleteItemAsync('authToken');
      return null;
    }
  }
}

export default new AuthService();