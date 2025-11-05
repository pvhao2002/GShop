import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import apiService from './apiService';

// Configure notification behavior for admin app
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

class AdminNotificationService {
  async registerForPushNotifications(): Promise<string | null> {
    let token = null;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      try {
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Admin push notification token:', token);
      } catch (error) {
        console.error('Error getting push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('admin-orders', {
        name: 'Order Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      Notifications.setNotificationChannelAsync('admin-users', {
        name: 'User Notifications',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  }

  async registerPushToken(token: string): Promise<{ success: boolean }> {
    try {
      const response = await apiService.post('/user/push-token', { token });
      return response.data;
    } catch (error) {
      console.error('Failed to register push token:', error);
      throw error;
    }
  }

  async scheduleLocalNotification(title: string, body: string, data?: any, channelId?: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        ...(Platform.OS === 'android' && channelId && { channelId }),
      },
      trigger: { 
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1 
      },
    });
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  addNotificationListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }

  // Handle different admin notification types
  handleAdminNotification(data: any) {
    const { type, orderId, userId, message } = data;
    
    switch (type) {
      case 'NEW_ORDER':
        return {
          title: 'New Order',
          body: `New order #${orderId?.substring(0, 8).toUpperCase()} received`,
          data: { orderId, screen: 'OrderDetail', channelId: 'admin-orders' }
        };
      case 'ORDER_PAYMENT_CONFIRMED':
        return {
          title: 'Payment Confirmed',
          body: `Payment confirmed for order #${orderId?.substring(0, 8).toUpperCase()}`,
          data: { orderId, screen: 'OrderDetail', channelId: 'admin-orders' }
        };
      case 'NEW_USER_REGISTRATION':
        return {
          title: 'New User',
          body: 'A new user has registered',
          data: { userId, screen: 'UserDetail', channelId: 'admin-users' }
        };
      case 'LOW_STOCK_ALERT':
        return {
          title: 'Low Stock Alert',
          body: message || 'Some products are running low on stock',
          data: { screen: 'Products', channelId: 'admin-orders' }
        };
      default:
        return {
          title: 'Admin Notification',
          body: message || 'You have a new notification',
          data: { type, channelId: 'admin-orders' }
        };
    }
  }
}

export default new AdminNotificationService();