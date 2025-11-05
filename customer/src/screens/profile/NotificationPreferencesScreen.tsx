import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  Spinner,
  useToast,
  ScrollView,
  Divider,
} from 'native-base';
import { SafeAreaView } from 'react-native-safe-area-context';
import notificationPreferencesService, { 
  NotificationPreferences, 
  UpdateNotificationPreferencesRequest 
} from '../../services/notificationPreferencesService';

const NotificationPreferencesScreen: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await notificationPreferencesService.getPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to load notification preferences',
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof UpdateNotificationPreferencesRequest, value: boolean) => {
    if (!preferences) return;

    try {
      setUpdating(true);
      const updateData: UpdateNotificationPreferencesRequest = {
        [key]: value,
      };
      
      const updatedPreferences = await notificationPreferencesService.updatePreferences(updateData);
      setPreferences(updatedPreferences);
      
      toast.show({
        title: 'Success',
        description: 'Notification preferences updated',
      });
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to update notification preferences',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner size="lg" />
          <Text mt={4}>Loading preferences...</Text>
        </Box>
      </SafeAreaView>
    );
  }

  if (!preferences) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Box flex={1} justifyContent="center" alignItems="center" p={4}>
          <Text textAlign="center">Failed to load notification preferences</Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView flex={1} bg="white">
        <VStack space={4} p={4}>
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Notification Preferences
          </Text>
          <Text fontSize="sm" color="gray.600" mb={4}>
            Choose which notifications you'd like to receive
          </Text>

          <VStack space={4}>
            {/* Order Updates */}
            <Box>
              <HStack justifyContent="space-between" alignItems="center" py={3}>
                <VStack flex={1} mr={4}>
                  <Text fontSize="md" fontWeight="medium">
                    Order Updates
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Get notified about order status changes
                  </Text>
                </VStack>
                <Switch
                  isChecked={preferences.orderUpdates}
                  onToggle={(value) => updatePreference('orderUpdates', value)}
                  isDisabled={updating}
                />
              </HStack>
              <Divider />
            </Box>

            {/* Delivery Notifications */}
            <Box>
              <HStack justifyContent="space-between" alignItems="center" py={3}>
                <VStack flex={1} mr={4}>
                  <Text fontSize="md" fontWeight="medium">
                    Delivery Notifications
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Get notified when your orders are delivered
                  </Text>
                </VStack>
                <Switch
                  isChecked={preferences.deliveryNotifications}
                  onToggle={(value) => updatePreference('deliveryNotifications', value)}
                  isDisabled={updating}
                />
              </HStack>
              <Divider />
            </Box>

            {/* Payment Notifications */}
            <Box>
              <HStack justifyContent="space-between" alignItems="center" py={3}>
                <VStack flex={1} mr={4}>
                  <Text fontSize="md" fontWeight="medium">
                    Payment Notifications
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Get notified about payment confirmations and issues
                  </Text>
                </VStack>
                <Switch
                  isChecked={preferences.paymentNotifications}
                  onToggle={(value) => updatePreference('paymentNotifications', value)}
                  isDisabled={updating}
                />
              </HStack>
              <Divider />
            </Box>

            {/* Promotions */}
            <Box>
              <HStack justifyContent="space-between" alignItems="center" py={3}>
                <VStack flex={1} mr={4}>
                  <Text fontSize="md" fontWeight="medium">
                    Promotions & Offers
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Get notified about special offers and promotions
                  </Text>
                </VStack>
                <Switch
                  isChecked={preferences.promotions}
                  onToggle={(value) => updatePreference('promotions', value)}
                  isDisabled={updating}
                />
              </HStack>
            </Box>
          </VStack>

          <Box mt={8} p={4} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" color="gray.600" textAlign="center">
              You can change these settings at any time. Some notifications may still be sent for important account or order information.
            </Text>
          </Box>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationPreferencesScreen;