import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import adminNotificationService from '../services/notificationService';
import { useAuthStore } from '../store/authStore';

interface AdminNotificationData {
  type: 'NEW_ORDER' | 'ORDER_PAYMENT_CONFIRMED' | 'NEW_USER_REGISTRATION' | 'LOW_STOCK_ALERT';
  orderId?: string;
  userId?: string;
  message?: string;
  screen?: string;
}

export const useAdminNotifications = (navigation?: any) => {
  const appState = useRef(AppState.currentState);
  const { user } = useAuthStore();

  const handleNotificationReceived = useCallback(
    (notification: Notifications.Notification) => {
      const data = notification.request.content.data as unknown as AdminNotificationData;
      
      console.log('Admin notification received:', data);
      
      // Update badge count
      adminNotificationService.getBadgeCount().then(count => {
        adminNotificationService.setBadgeCount(count + 1);
      });

      // You could dispatch actions here to update the admin dashboard
      // For example, refresh order counts, user counts, etc.
    },
    []
  );

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as unknown as AdminNotificationData;
      
      if (navigation && data?.screen) {
        // Clear badge when admin interacts with notification
        adminNotificationService.clearBadge();
        
        // Navigate to appropriate screen
        switch (data.screen) {
          case 'OrderDetail':
            if (data.orderId) {
              navigation.navigate('OrderDetail', { orderId: data.orderId });
            } else {
              navigation.navigate('Orders');
            }
            break;
          case 'UserDetail':
            if (data.userId) {
              navigation.navigate('UserDetail', { userId: data.userId });
            } else {
              navigation.navigate('Users');
            }
            break;
          case 'Products':
            navigation.navigate('Products');
            break;
          default:
            navigation.navigate('Dashboard');
        }
      }
    },
    [navigation]
  );

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground, clear badge
      adminNotificationService.clearBadge();
    }
    appState.current = nextAppState;
  }, []);

  const registerForNotifications = useCallback(async () => {
    try {
      const token = await adminNotificationService.registerForPushNotifications();
      if (token && user) {
        // Register the token with the backend
        await adminNotificationService.registerPushToken(token);
        console.log('Admin push notification token registered successfully');
      }
    } catch (error) {
      console.error('Failed to register for admin push notifications:', error);
    }
  }, [user]);

  const scheduleTestNotification = useCallback(async (type: string, message: string) => {
    const notificationData = adminNotificationService.handleAdminNotification({
      type,
      message,
    });
    
    if (notificationData) {
      await adminNotificationService.scheduleLocalNotification(
        notificationData.title,
        notificationData.body,
        notificationData.data,
        notificationData.data.channelId
      );
    }
  }, []);

  useEffect(() => {
    // Only register if user is authenticated and is admin
    if (user && user.role === 'ROLE_ADMIN') {
      registerForNotifications();
    }

    // Set up notification listeners
    const notificationListener = adminNotificationService.addNotificationListener(
      handleNotificationReceived
    );

    const responseListener = adminNotificationService.addNotificationResponseListener(
      handleNotificationResponse
    );

    // Set up app state listener
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Clear badge when app starts
    adminNotificationService.clearBadge();

    // Cleanup listeners on unmount
    return () => {
      notificationListener.remove();
      responseListener.remove();
      appStateSubscription?.remove();
    };
  }, [user, registerForNotifications, handleNotificationReceived, handleNotificationResponse, handleAppStateChange]);

  return {
    registerForNotifications,
    scheduleTestNotification,
  };
};