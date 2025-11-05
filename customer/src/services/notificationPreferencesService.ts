import api from './api';

export interface NotificationPreferences {
  id: string;
  orderUpdates: boolean;
  promotions: boolean;
  deliveryNotifications: boolean;
  paymentNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationPreferencesRequest {
  orderUpdates?: boolean;
  promotions?: boolean;
  deliveryNotifications?: boolean;
  paymentNotifications?: boolean;
}

class NotificationPreferencesService {
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get('/api/notifications/preferences');
    return response.data;
  }

  async updatePreferences(preferences: UpdateNotificationPreferencesRequest): Promise<NotificationPreferences> {
    const response = await api.put('/api/notifications/preferences', preferences);
    return response.data;
  }

  async removePushToken(): Promise<{ success: boolean; message: string }> {
    const response = await api.delete('/api/notifications/push-token');
    return response.data;
  }
}

export default new NotificationPreferencesService();