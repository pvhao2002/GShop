import { useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AppDispatch } from '../store';
import { updateOrderStatus } from '../store/slices/orderSlice';
import notificationService from '../services/notificationService';
import orderService from '../services/orderService';

interface OrderNotificationData {
  orderId: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'COMPLETED' | 'CANCELED';
  title: string;
  message: string;
}

export const useOrderNotifications = (navigation?: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const appState = useRef(AppState.currentState);

  const handleNotificationReceived = useCallback(
    (notification: Notifications.Notification) => {
      const data = notification.request.content.data as unknown as OrderNotificationData;
      
      if (data?.orderId && data?.status) {
        // Update order status in the store
        dispatch(updateOrderStatus({
          orderId: data.orderId,
          status: data.status,
        }));

        // Update badge count
        notificationService.getBadgeCount().then(count => {
          notificationService.setBadgeCount(count + 1);
        });
      }
    },
    [dispatch]
  );

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as unknown as OrderNotificationData;
      
      if (data?.orderId && navigation) {
        // Clear badge when user interacts with notification
        notificationService.clearBadge();
        
        // Navigate to order detail screen
        navigation.navigate('OrderDetail', { orderId: data.orderId });
      }
    },
    [navigation]
  );

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground, clear badge
      notificationService.clearBadge();
    }
    appState.current = nextAppState;
  }, []);

  const registerForNotifications = useCallback(async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        // Register the token with the backend
        await orderService.registerPushToken(token);
        console.log('Push notification token registered successfully');
      }
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
  }, []);

  useEffect(() => {
    // Register for push notifications
    registerForNotifications();

    // Set up notification listeners
    const notificationListener = notificationService.addNotificationListener(
      handleNotificationReceived
    );

    const responseListener = notificationService.addNotificationResponseListener(
      handleNotificationResponse
    );

    // Set up app state listener
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Clear badge when app starts
    notificationService.clearBadge();

    // Cleanup listeners on unmount
    return () => {
      notificationListener.remove();
      responseListener.remove();
      appStateSubscription?.remove();
    };
  }, [registerForNotifications, handleNotificationReceived, handleNotificationResponse, handleAppStateChange]);

  const scheduleTestNotification = useCallback(async (orderId: string, status: string) => {
    const title = 'Order Update';
    const body = `Your order #${orderId.slice(-8).toUpperCase()} status has been updated to ${status}`;
    
    await notificationService.scheduleLocalNotification(title, body, {
      orderId,
      status,
      title,
      message: body,
    });
  }, []);

  return {
    registerForNotifications,
    scheduleTestNotification,
  };
};