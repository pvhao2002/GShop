import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Check if app is in foreground
    const isInForeground = notification.request.content.data?.showInForeground !== false;
    
    return {
      shouldShowAlert: isInForeground,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: isInForeground,
      shouldShowList: true,
    };
  },
});

class NotificationService {
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
        console.log('Push notification token:', token);
      } catch (error) {
        console.error('Error getting push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  }

  async scheduleLocalNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
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

  async getAllNotifications() {
    return await Notifications.getAllPresentedNotificationsAsync();
  }

  async dismissAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }

  async dismissNotification(identifier: string) {
    await Notifications.dismissNotificationAsync(identifier);
  }

  // Handle different notification types
  handleOrderNotification(data: any) {
    const { orderId, status, type } = data;
    
    switch (type) {
      case 'ORDER_CREATED':
        return {
          title: 'Order Confirmed',
          body: `Your order #${orderId.substring(0, 8).toUpperCase()} has been confirmed`,
          data: { orderId, status, screen: 'OrderDetail' }
        };
      case 'ORDER_STATUS_UPDATE':
        return {
          title: 'Order Update',
          body: `Your order status has been updated to ${status}`,
          data: { orderId, status, screen: 'OrderDetail' }
        };
      case 'ORDER_DELIVERED':
        return {
          title: 'Order Delivered',
          body: `Your order #${orderId.substring(0, 8).toUpperCase()} has been delivered`,
          data: { orderId, status, screen: 'OrderDetail' }
        };
      case 'ORDER_CANCELLED':
        return {
          title: 'Order Cancelled',
          body: `Your order #${orderId.substring(0, 8).toUpperCase()} has been cancelled`,
          data: { orderId, status, screen: 'OrderDetail' }
        };
      default:
        return null;
    }
  }
}

export default new NotificationService();