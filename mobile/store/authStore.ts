import { create } from 'zustand';
import { User, RegisterData } from '../types';
import authService from '../services/authService';

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    
    // Actions
    setUser: (user: User | null) => void;
    setTokens: (token: string | null, refreshToken?: string | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearAuth: () => void;
    updateAuthState: (user: User, token: string, refreshToken?: string | null) => void;
    initializeAuth: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    refreshToken: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,

    setUser: (user) => {
        set({ 
            user, 
            isAuthenticated: !!user 
        });
    },

    setTokens: (token, refreshToken = null) => {
        set({ 
            token, 
            refreshToken,
            isAuthenticated: !!token 
        });
    },

    setLoading: (isLoading) => {
        set({ isLoading });
    },

    setError: (error) => {
        set({ error });
    },

    clearAuth: () => {
        set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null
        });
    },

    updateAuthState: (user, token, refreshToken) => {
        set({
            user,
            token,
            refreshToken: refreshToken || null,
            isAuthenticated: true,
            error: null
        });
    },

    initializeAuth: async () => {
        set({ isLoading: true, error: null });
        try {
            const authData = await authService.initializeAuth();
            if (authData) {
                set({
                    user: authData.user,
                    token: authData.token,
                    refreshToken: authData.refreshToken || null,
                    isAuthenticated: true
                });
            }
        } catch (error: any) {
            set({ error: error.message || 'Auth initialization failed' });
        } finally {
            set({ isLoading: false });
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.login({ email, password });
            set({
                user: response.user,
                token: response.token,
                refreshToken: response.refreshToken || null,
                isAuthenticated: true
            });
        } catch (error: any) {
            set({ error: error.message || 'Login failed' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.register(data);
            set({
                user: response.user,
                token: response.token,
                refreshToken: response.refreshToken || null,
                isAuthenticated: true
            });
        } catch (error: any) {
            set({ error: error.message || 'Registration failed' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await authService.logout();
            set({
                user: null,
                token: null,
                refreshToken: null,
                isAuthenticated: false,
                error: null
            });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            set({ isLoading: false });
        }
    },
}));

export type { AuthState };
