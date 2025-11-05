import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';
import adminNotificationService from '../../services/notificationService';

const NotificationSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState({
    newOrders: true,
    paymentConfirmations: true,
    newUsers: true,
    lowStockAlerts: true,
    systemAlerts: true,
  });

  const { scheduleTestNotification } = useAdminNotifications();

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const testNotification = async (type: string, message: string) => {
    try {
      await scheduleTestNotification(type, message);
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const clearAllNotifications = async () => {
    try {
      await adminNotificationService.cancelAllNotifications();
      await adminNotificationService.clearBadge();
      Alert.alert('Success', 'All notifications cleared!');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear notifications');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Notification Settings</Text>
          <Text style={styles.subtitle}>
            Manage your admin notification preferences
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Notifications</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>New Orders</Text>
                <Text style={styles.settingDescription}>
                  Get notified when new orders are placed
                </Text>
              </View>
              <Switch
                value={settings.newOrders}
                onValueChange={(value) => updateSetting('newOrders', value)}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Payment Confirmations</Text>
                <Text style={styles.settingDescription}>
                  Get notified when payments are confirmed
                </Text>
              </View>
              <Switch
                value={settings.paymentConfirmations}
                onValueChange={(value) => updateSetting('paymentConfirmations', value)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Notifications</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>New User Registrations</Text>
                <Text style={styles.settingDescription}>
                  Get notified when new users register
                </Text>
              </View>
              <Switch
                value={settings.newUsers}
                onValueChange={(value) => updateSetting('newUsers', value)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Notifications</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Low Stock Alerts</Text>
                <Text style={styles.settingDescription}>
                  Get notified when products are running low on stock
                </Text>
              </View>
              <Switch
                value={settings.lowStockAlerts}
                onValueChange={(value) => updateSetting('lowStockAlerts', value)}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>System Alerts</Text>
                <Text style={styles.settingDescription}>
                  Get notified about system issues and updates
                </Text>
              </View>
              <Switch
                value={settings.systemAlerts}
                onValueChange={(value) => updateSetting('systemAlerts', value)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Notifications</Text>
            
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => testNotification('NEW_ORDER', 'Test new order notification')}
            >
              <Text style={styles.testButtonText}>Test New Order Notification</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => testNotification('LOW_STOCK_ALERT', 'Test low stock alert')}
            >
              <Text style={styles.testButtonText}>Test Low Stock Alert</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, styles.clearButton]}
              onPress={clearAllNotifications}
            >
              <Text style={[styles.testButtonText, styles.clearButtonText]}>
                Clear All Notifications
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Notification settings are saved locally on your device. Some critical 
              notifications may still be sent regardless of these settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  testButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#ef4444',
  },
  clearButtonText: {
    color: 'white',
  },
  infoBox: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationSettingsScreen;