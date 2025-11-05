import React, { useState } from 'react';
import {
  Box,
  ScrollView,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Switch,
  Divider,
  Alert,
  Avatar,
  Center,
  useToast
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export const ProfileScreen: React.FC = () => {
  const { user, logout, updateProfile } = useAuthStore();
  const toast = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile({ firstName, lastName, email });
      
      toast.show({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
        duration: 3000,
      });
      
      setIsEditing(false);
    } catch (error: any) {
      toast.show({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.show({
        title: "Logged Out",
        description: "You have been logged out successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box flex={1} bg="gray.50">
      <ScrollView>
        <VStack space={4} p={4}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center" mb={2}>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Profile & Settings
            </Text>
            <Button
              variant="ghost"
              onPress={() => setIsEditing(!isEditing)}
              leftIcon={<Ionicons name={isEditing ? "close" : "pencil"} size={16} />}
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </HStack>

          {/* Profile Section */}
          <Box bg="white" rounded="lg" shadow={2} p={4}>
            <VStack space={4}>
              <HStack alignItems="center" space={4}>
                <Avatar
                  size="lg"
                  bg="primary.500"
                  source={{
                    uri: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=3B82F6&color=fff`
                  }}
                >
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </Avatar>
                <VStack flex={1}>
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    {user?.firstName} {user?.lastName}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {user?.email}
                  </Text>
                  <Text fontSize="xs" color="primary.500" fontWeight="medium">
                    Administrator
                  </Text>
                </VStack>
              </HStack>

              {isEditing && (
                <VStack space={3}>
                  <Input
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                  <Input
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                  <Input
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Button
                    onPress={handleSaveProfile}
                    isLoading={isLoading}
                    isLoadingText="Saving..."
                    colorScheme="primary"
                  >
                    Save Changes
                  </Button>
                </VStack>
              )}
            </VStack>
          </Box>

          {/* Settings Section */}
          <Box bg="white" rounded="lg" shadow={2} p={4}>
            <VStack space={4}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                App Settings
              </Text>

              <VStack space={3}>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack>
                    <Text fontSize="md" color="gray.800">
                      Push Notifications
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Receive notifications for orders and updates
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={notificationsEnabled}
                    onToggle={setNotificationsEnabled}
                    colorScheme="primary"
                  />
                </HStack>

                <Divider />

                <HStack justifyContent="space-between" alignItems="center">
                  <VStack>
                    <Text fontSize="md" color="gray.800">
                      Dark Mode
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Switch to dark theme
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={darkModeEnabled}
                    onToggle={setDarkModeEnabled}
                    colorScheme="primary"
                  />
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Security Section */}
          <Box bg="white" rounded="lg" shadow={2} p={4}>
            <VStack space={4}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                Security
              </Text>

              <VStack space={3}>
                <Button
                  variant="outline"
                  leftIcon={<Ionicons name="key-outline" size={16} />}
                  onPress={() => {
                    toast.show({
                      title: "Feature Coming Soon",
                      description: "Password change functionality will be available soon",
                      duration: 3000,
                    });
                  }}
                >
                  Change Password
                </Button>

                <Button
                  variant="outline"
                  leftIcon={<Ionicons name="shield-outline" size={16} />}
                  onPress={() => {
                    toast.show({
                      title: "Feature Coming Soon",
                      description: "Two-factor authentication will be available soon",
                      duration: 3000,
                    });
                  }}
                >
                  Two-Factor Authentication
                </Button>
              </VStack>
            </VStack>
          </Box>

          {/* About Section */}
          <Box bg="white" rounded="lg" shadow={2} p={4}>
            <VStack space={4}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                About
              </Text>

              <VStack space={2}>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.600">App Version</Text>
                  <Text fontSize="sm" color="gray.800">1.0.0</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.600">Last Login</Text>
                  <Text fontSize="sm" color="gray.800">
                    {new Date().toLocaleDateString()}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Logout Section */}
          <Box bg="white" rounded="lg" shadow={2} p={4}>
            <Button
              colorScheme="red"
              variant="outline"
              leftIcon={<Ionicons name="log-out-outline" size={16} />}
              onPress={handleLogout}
            >
              Sign Out
            </Button>
          </Box>
        </VStack>
      </ScrollView>
    </Box>
  );
};