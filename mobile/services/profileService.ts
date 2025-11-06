import { User, Address } from '../types';
import apiService from './apiService';

interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: Address;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

class ProfileService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return apiService.get<User>('/profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    return apiService.put<User>('/profile', profileData);
  }

  /**
   * Change user password
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    return apiService.put<void>('/profile/password', passwordData);
  }

  /**
   * Upload profile avatar
   */
  async uploadAvatar(imageUri: string): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    return apiService.post<{ avatarUrl: string }>('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    return apiService.delete<void>('/profile');
  }
}

export default new ProfileService();