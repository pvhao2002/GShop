import apiService from './apiService';
import { 
  User, 
  UsersResponse, 
  UserFilters, 
  UserUpdateRequest, 
  UserDetailResponse,
  UserAnalytics 
} from '../types/user';

export const userService = {
  // Get paginated list of users with filters
  async getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await apiService.get(`/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get detailed user information
  async getUserDetail(userId: string): Promise<UserDetailResponse> {
    try {
      const response = await apiService.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user detail:', error);
      throw error;
    }
  },

  // Update user information
  async updateUser(userId: string, updateData: UserUpdateRequest): Promise<User> {
    try {
      const response = await apiService.put(`/users/${userId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Update user role
  async updateUserRole(userId: string, role: 'ROLE_USER' | 'ROLE_ADMIN'): Promise<User> {
    try {
      const response = await apiService.put(`/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Update user status
  async updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<User> {
    try {
      const response = await apiService.put(`/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Get user analytics
  async getUserAnalytics(): Promise<UserAnalytics> {
    try {
      const response = await apiService.get('/users/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  },

  // Delete user (soft delete)
  async deleteUser(userId: string): Promise<void> {
    try {
      await apiService.delete(`/users/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Get user activity log
  async getUserActivity(userId: string, page: number = 1, limit: number = 20) {
    try {
      const response = await apiService.get(`/users/${userId}/activity?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  }
};