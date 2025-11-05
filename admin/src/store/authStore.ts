import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '../services/apiService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    try {
      const response = await apiService.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      // Validate admin role
      if (user.role !== 'ROLE_ADMIN') {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Store token securely
      await SecureStore.setItemAsync('admin_token', token);
      await SecureStore.setItemAsync('admin_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  logout: async () => {
    try {
      // Clear stored data
      await SecureStore.deleteItemAsync('admin_token');
      await SecureStore.deleteItemAsync('admin_user');

      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  loadStoredAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('admin_token');
      const userString = await SecureStore.getItemAsync('admin_user');

      if (token && userString) {
        const user = JSON.parse(userString);
        
        set({
          user,
          token,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Load stored auth error:', error);
      // Clear invalid stored data
      await SecureStore.deleteItemAsync('admin_token');
      await SecureStore.deleteItemAsync('admin_user');
    }
  },

  updateProfile: async (profileData: Partial<User>) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');

    try {
      // TODO: Implement API call to update profile
      // const response = await apiService.put('/admin/profile', profileData);
      // const updatedUser = response.data;

      // For now, update locally
      const updatedUser = { ...user, ...profileData };
      
      // Store updated user data
      await SecureStore.setItemAsync('admin_user', JSON.stringify(updatedUser));
      
      set({ user: updatedUser });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  },
}));