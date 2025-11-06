import axios, { AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types';

const API_BASE_URL = 'http://localhost:8080/api/auth';
// ⚠️ For physical device, change to your LAN IP:
// const API_BASE_URL = 'http://192.168.x.x:8080/api/auth';

// Storage keys
const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'userData';

class AuthService {
    private isRefreshing = false;
    private refreshPromise: Promise<string> | null = null;

    /**
     * Login with email and password
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response: AxiosResponse<AuthResponse> = await axios.post(
                `${API_BASE_URL}/login`, 
                credentials
            );
            
            const { user, token, refreshToken } = response.data;
            
            // Store tokens and user data securely
            await this.storeAuthData(user, token, refreshToken);
            
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    }

    /**
     * Register new user account
     */
    async register(userData: RegisterData): Promise<AuthResponse> {
        try {
            const response: AxiosResponse<AuthResponse> = await axios.post(
                `${API_BASE_URL}/register`, 
                userData
            );
            
            const { user, token, refreshToken } = response.data;
            
            // Store tokens and user data securely
            await this.storeAuthData(user, token, refreshToken);
            
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    }

    /**
     * Logout user and clear stored data
     */
    async logout(): Promise<void> {
        try {
            const token = await this.getStoredToken();
            if (token) {
                // Notify server about logout
                await axios.post(`${API_BASE_URL}/logout`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.warn('Server logout failed:', error);
        } finally {
            // Always clear local storage
            await this.clearAuthData();
        }
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(): Promise<string> {
        if (this.isRefreshing && this.refreshPromise) {
            return this.refreshPromise;
        }

        this.isRefreshing = true;
        this.refreshPromise = this.performTokenRefresh();

        try {
            const newToken = await this.refreshPromise;
            return newToken;
        } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
        }
    }

    private async performTokenRefresh(): Promise<string> {
        try {
            const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response: AxiosResponse<{ token: string; refreshToken: string }> = 
                await axios.post(`${API_BASE_URL}/refresh`, {
                    refreshToken
                });

            const { token, refreshToken: newRefreshToken } = response.data;
            
            // Update stored tokens
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            if (newRefreshToken) {
                await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
            }

            return token;
        } catch (error: any) {
            // If refresh fails, clear all auth data
            await this.clearAuthData();
            throw new Error('Token refresh failed');
        }
    }

    /**
     * Validate current token and get user data
     */
    async validateToken(): Promise<AuthResponse | null> {
        try {
            const token = await this.getStoredToken();
            if (!token) return null;

            const response: AxiosResponse<{ user: User }> = await axios.get(
                `${API_BASE_URL}/me`, 
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
            
            return {
                user: response.data.user,
                token,
                refreshToken: refreshToken || ''
            };
        } catch (error: any) {
            if (error.response?.status === 401) {
                // Try to refresh token
                try {
                    const newToken = await this.refreshToken();
                    return this.validateToken(); // Retry with new token
                } catch (refreshError) {
                    await this.clearAuthData();
                    return null;
                }
            }
            
            console.error('Token validation failed:', error);
            await this.clearAuthData();
            return null;
        }
    }

    /**
     * Initialize authentication on app startup
     */
    async initializeAuth(): Promise<AuthResponse | null> {
        try {
            const [token, refreshToken, userData] = await Promise.all([
                SecureStore.getItemAsync(TOKEN_KEY),
                SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
                SecureStore.getItemAsync(USER_KEY)
            ]);

            if (!token || !userData) {
                return null;
            }

            const user: User = JSON.parse(userData);
            
            // Validate token with server
            const validationResult = await this.validateToken();
            if (validationResult) {
                return validationResult;
            }

            return null;
        } catch (error) {
            console.error('Auth initialization failed:', error);
            await this.clearAuthData();
            return null;
        }
    }

    /**
     * Get current user from storage
     */
    async getCurrentUser(): Promise<User | null> {
        try {
            const userData = await SecureStore.getItemAsync(USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Failed to get current user:', error);
            return null;
        }
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        const token = await this.getStoredToken();
        return !!token;
    }

    /**
     * Check if user has specific role
     */
    async hasRole(role: 'customer' | 'admin'): Promise<boolean> {
        const user = await this.getCurrentUser();
        return user?.role === role;
    }

    /**
     * Check if user is admin
     */
    async isAdmin(): Promise<boolean> {
        return this.hasRole('admin');
    }

    /**
     * Check if user is customer
     */
    async isCustomer(): Promise<boolean> {
        return this.hasRole('customer');
    }

    /**
     * Get stored access token
     */
    async getStoredToken(): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(TOKEN_KEY);
        } catch (error) {
            console.error('Failed to get stored token:', error);
            return null;
        }
    }

    /**
     * Get stored refresh token
     */
    async getStoredRefreshToken(): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        } catch (error) {
            console.error('Failed to get stored refresh token:', error);
            return null;
        }
    }

    /**
     * Store authentication data securely
     */
    private async storeAuthData(user: User, token: string, refreshToken?: string): Promise<void> {
        try {
            await Promise.all([
                SecureStore.setItemAsync(TOKEN_KEY, token),
                SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
                refreshToken ? SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken) : Promise.resolve()
            ]);
        } catch (error) {
            console.error('Failed to store auth data:', error);
            throw new Error('Failed to store authentication data');
        }
    }

    /**
     * Clear all stored authentication data
     */
    private async clearAuthData(): Promise<void> {
        try {
            await Promise.all([
                SecureStore.deleteItemAsync(TOKEN_KEY),
                SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
                SecureStore.deleteItemAsync(USER_KEY)
            ]);
        } catch (error) {
            console.error('Failed to clear auth data:', error);
        }
    }

    /**
     * Request password reset
     */
    async requestPasswordReset(email: string): Promise<void> {
        try {
            await axios.post(`${API_BASE_URL}/forgot-password`, { email });
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Password reset request failed');
        }
    }

    /**
     * Reset password with token
     */
    async resetPassword(token: string, newPassword: string): Promise<void> {
        try {
            await axios.post(`${API_BASE_URL}/reset-password`, {
                token,
                password: newPassword
            });
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Password reset failed');
        }
    }
}

export default new AuthService();
