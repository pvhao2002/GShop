import api from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  pushNotifications: boolean;
}

class UserService {
  async getProfile(): Promise<User> {
    const response = await api.get('/user/profile');
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await api.put('/user/profile', data);
    return response.data;
  }

  async getAddresses(): Promise<Address[]> {
    const response = await api.get('/user/addresses');
    return response.data;
  }

  async createAddress(data: CreateAddressRequest): Promise<Address> {
    const response = await api.post('/user/addresses', data);
    return response.data;
  }

  async updateAddress(id: string, data: UpdateAddressRequest): Promise<Address> {
    const response = await api.put(`/user/addresses/${id}`, data);
    return response.data;
  }

  async deleteAddress(id: string): Promise<void> {
    await api.delete(`/user/addresses/${id}`);
  }

  async setDefaultAddress(id: string): Promise<void> {
    await api.put(`/user/addresses/${id}/default`);
  }

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await api.get('/user/notification-preferences');
    return response.data;
  }

  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await api.put('/user/notification-preferences', preferences);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/user/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async deleteAccount(): Promise<void> {
    await api.delete('/user/account');
  }
}

export default new UserService();