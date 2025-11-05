import React, { useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  VStack,
  HStack,
  ScrollView,
  Radio,
  Heading,
  Text,
  Switch,
  Button,
  Divider,
  IconButton,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import ThemedSafeAreaView from '../../components/common/ThemedSafeAreaView';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../hooks/useAuth';
import { fontSizes, spacing } from '../../utils/responsive';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, themeMode, setThemeMode } = useTheme();
  const { logout } = useAuth();
  const { 
    notificationPreferences, 
    isLoading, 
    loadNotificationPreferences, 
    updateNotificationPreferences 
  } = useProfile();

  useEffect(() => {
    loadNotificationPreferences();
  }, []);

  const handleThemeChange = (value: string) => {
    setThemeMode(value as ThemeMode);
  };

  const handleNotificationToggle = async (key: string, value: boolean) => {
    if (notificationPreferences) {
      await updateNotificationPreferences({ [key]: value });
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Info', 'Account deletion will be implemented in a future update.');
          },
        },
      ]
    );
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ScrollView flex={1} bg={colors.background}>
        <VStack space={spacing.lg} p={spacing.md}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center">
            <Heading size="lg" color={colors.text}>Settings</Heading>
            <IconButton
              icon={<Ionicons name="close" size={24} color={colors.text} />}
              onPress={() => navigation.goBack()}
            />
          </HStack>

          {/* Theme Preferences */}
          <VStack space={spacing.md}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Theme Preferences
            </Text>
            
            <Radio.Group 
              name="themeMode" 
              value={themeMode} 
              onChange={handleThemeChange}
            >
              <VStack space={spacing.sm}>
                <Radio value="light" colorScheme="primary">
                  <Text style={[styles.radioLabel, { color: colors.text }]}>
                    Light Mode
                  </Text>
                </Radio>
                <Radio value="dark" colorScheme="primary">
                  <Text style={[styles.radioLabel, { color: colors.text }]}>
                    Dark Mode
                  </Text>
                </Radio>
                <Radio value="auto" colorScheme="primary">
                  <Text style={[styles.radioLabel, { color: colors.text }]}>
                    System Default
                  </Text>
                </Radio>
              </VStack>
            </Radio.Group>
          </VStack>

          <Divider />

          {/* Notification Preferences */}
          <VStack space={spacing.md}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Notification Preferences
            </Text>
            
            {notificationPreferences && (
              <VStack space={spacing.sm}>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Text fontSize={fontSizes.md} color={colors.text}>
                      Order Updates
                    </Text>
                    <Text fontSize={fontSizes.sm} color={colors.textSecondary}>
                      Get notified about order status changes
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={notificationPreferences.orderUpdates}
                    onToggle={(value) => handleNotificationToggle('orderUpdates', value)}
                    colorScheme="primary"
                    isDisabled={isLoading}
                  />
                </HStack>

                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Text fontSize={fontSizes.md} color={colors.text}>
                      Push Notifications
                    </Text>
                    <Text fontSize={fontSizes.sm} color={colors.textSecondary}>
                      Receive push notifications on your device
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={notificationPreferences.pushNotifications}
                    onToggle={(value) => handleNotificationToggle('pushNotifications', value)}
                    colorScheme="primary"
                    isDisabled={isLoading}
                  />
                </HStack>

                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Text fontSize={fontSizes.md} color={colors.text}>
                      Promotions
                    </Text>
                    <Text fontSize={fontSizes.sm} color={colors.textSecondary}>
                      Get notified about special offers and discounts
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={notificationPreferences.promotions}
                    onToggle={(value) => handleNotificationToggle('promotions', value)}
                    colorScheme="primary"
                    isDisabled={isLoading}
                  />
                </HStack>

                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Text fontSize={fontSizes.md} color={colors.text}>
                      Newsletter
                    </Text>
                    <Text fontSize={fontSizes.sm} color={colors.textSecondary}>
                      Receive our weekly newsletter
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={notificationPreferences.newsletter}
                    onToggle={(value) => handleNotificationToggle('newsletter', value)}
                    colorScheme="primary"
                    isDisabled={isLoading}
                  />
                </HStack>
              </VStack>
            )}
          </VStack>

          <Divider />

          {/* Account Management */}
          <VStack space={spacing.md}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Account Management
            </Text>
            
            <VStack space={spacing.sm}>
              <Button
                variant="ghost"
                justifyContent="flex-start"
                leftIcon={<Ionicons name="location-outline" size={20} />}
                onPress={() => navigation.navigate('AddressManagement' as never)}
              >
                Manage Addresses
              </Button>
              
              <Button
                variant="ghost"
                justifyContent="flex-start"
                leftIcon={<Ionicons name="lock-closed-outline" size={20} />}
                onPress={() => navigation.navigate('ChangePassword' as never)}
              >
                Change Password
              </Button>
              
              <Button
                variant="ghost"
                justifyContent="flex-start"
                leftIcon={<Ionicons name="help-circle-outline" size={20} />}
                onPress={() => navigation.navigate('Help' as never)}
              >
                Help & Support
              </Button>
              
              <Button
                variant="ghost"
                justifyContent="flex-start"
                leftIcon={<Ionicons name="document-text-outline" size={20} />}
                onPress={() => navigation.navigate('PrivacyPolicy' as never)}
              >
                Privacy Policy
              </Button>
              
              <Button
                variant="ghost"
                justifyContent="flex-start"
                leftIcon={<Ionicons name="document-outline" size={20} />}
                onPress={() => navigation.navigate('TermsOfService' as never)}
              >
                Terms of Service
              </Button>
            </VStack>
          </VStack>

          <Divider />

          {/* Danger Zone */}
          <VStack space={spacing.md}>
            <Text style={[styles.sectionTitle, { color: colors.error }]}>
              Danger Zone
            </Text>
            
            <VStack space={spacing.sm}>
              <Button
                variant="outline"
                colorScheme="red"
                onPress={handleLogout}
                leftIcon={<Ionicons name="log-out-outline" size={20} />}
              >
                Logout
              </Button>
              
              <Button
                variant="outline"
                colorScheme="red"
                onPress={handleDeleteAccount}
                leftIcon={<Ionicons name="trash-outline" size={20} />}
              >
                Delete Account
              </Button>
            </VStack>
          </VStack>
        </VStack>
      </ScrollView>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
  },
  radioLabel: {
    fontSize: fontSizes.md,
    marginLeft: spacing.sm,
  },
});

export default SettingsScreen;