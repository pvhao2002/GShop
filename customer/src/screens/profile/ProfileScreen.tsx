import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  VStack,
  HStack,
  ScrollView,
  Avatar,
  Heading,
  Text,
  Button,
  IconButton,
  Divider,
  FormControl,
  Input,
  Modal,
  useDisclose,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import ThemedSafeAreaView from '../../components/common/ThemedSafeAreaView';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { spacing, fontSizes } from '../../utils/responsive';
import { UpdateProfileRequest } from '../../services/userService';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const { profile, isLoading, loadProfile, updateProfile } = useProfile();
  const { isOpen, onOpen, onClose } = useDisclose();

  const [editForm, setEditForm] = useState<UpdateProfileRequest>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  const handleEditProfile = () => {
    onOpen();
  };

  const handleSaveProfile = async () => {
    const success = await updateProfile(editForm);
    if (success) {
      onClose();
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

  const getInitials = () => {
    const firstName = profile?.firstName || user?.firstName || '';
    const lastName = profile?.lastName || user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const profileData = profile || user;

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ScrollView flex={1} bg={colors.background}>
        <VStack space={spacing.lg} p={spacing.md}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center">
            <Heading size="lg" color={colors.text}>Profile</Heading>
            <IconButton
              icon={<Ionicons name="settings-outline" size={24} color={colors.text} />}
              onPress={() => navigation.navigate('Settings' as never)}
            />
          </HStack>

          {/* Profile Info */}
          <VStack space={spacing.md} alignItems="center">
            <Avatar
              size="xl"
              bg={colors.primary}
              _text={{ color: 'white', fontSize: fontSizes.xl }}
            >
              {getInitials()}
            </Avatar>
            
            <VStack alignItems="center" space={spacing.xs}>
              <Text fontSize={fontSizes.xl} fontWeight="600" color={colors.text}>
                {profileData?.firstName} {profileData?.lastName}
              </Text>
              <Text fontSize={fontSizes.md} color={colors.textSecondary}>
                {profileData?.email}
              </Text>
            </VStack>

            <Button
              variant="outline"
              onPress={handleEditProfile}
              leftIcon={<Ionicons name="pencil" size={16} />}
            >
              Edit Profile
            </Button>
          </VStack>

          <Divider />

          {/* Profile Details */}
          <VStack space={spacing.md}>
            <Text fontSize={fontSizes.lg} fontWeight="600" color={colors.text}>
              Personal Information
            </Text>
            
            <VStack space={spacing.sm}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize={fontSizes.md} color={colors.textSecondary}>
                  Phone
                </Text>
                <Text fontSize={fontSizes.md} color={colors.text}>
                  {profileData?.phone || 'Not provided'}
                </Text>
              </HStack>
              
              <HStack justifyContent="space-between" alignItems="flex-start">
                <Text fontSize={fontSizes.md} color={colors.textSecondary}>
                  Address
                </Text>
                <Text 
                  fontSize={fontSizes.md} 
                  color={colors.text}
                  textAlign="right"
                  flex={1}
                  ml={spacing.md}
                >
                  {profileData?.address || 'Not provided'}
                </Text>
              </HStack>
            </VStack>
          </VStack>

          <Divider />

          {/* Quick Actions */}
          <VStack space={spacing.md}>
            <Text fontSize={fontSizes.lg} fontWeight="600" color={colors.text}>
              Quick Actions
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
                leftIcon={<Ionicons name="notifications-outline" size={20} />}
                onPress={() => navigation.navigate('Settings' as never)}
              >
                Notification Settings
              </Button>
            </VStack>
          </VStack>

          <Divider />

          {/* Logout Button */}
          <Button
            colorScheme="red"
            variant="outline"
            onPress={handleLogout}
            leftIcon={<Ionicons name="log-out-outline" size={20} />}
          >
            Logout
          </Button>
        </VStack>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Edit Profile</Modal.Header>
          <Modal.Body>
            <VStack space={spacing.md}>
              <HStack space={spacing.sm}>
                <FormControl flex={1}>
                  <FormControl.Label>First Name</FormControl.Label>
                  <Input
                    value={editForm.firstName}
                    onChangeText={(value) => setEditForm(prev => ({ ...prev, firstName: value }))}
                    placeholder="Enter first name"
                  />
                </FormControl>
                
                <FormControl flex={1}>
                  <FormControl.Label>Last Name</FormControl.Label>
                  <Input
                    value={editForm.lastName}
                    onChangeText={(value) => setEditForm(prev => ({ ...prev, lastName: value }))}
                    placeholder="Enter last name"
                  />
                </FormControl>
              </HStack>
              
              <FormControl>
                <FormControl.Label>Phone</FormControl.Label>
                <Input
                  value={editForm.phone}
                  onChangeText={(value) => setEditForm(prev => ({ ...prev, phone: value }))}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </FormControl>
              
              <FormControl>
                <FormControl.Label>Address</FormControl.Label>
                <Input
                  value={editForm.address}
                  onChangeText={(value) => setEditForm(prev => ({ ...prev, address: value }))}
                  placeholder="Enter address"
                  multiline
                  numberOfLines={3}
                />
              </FormControl>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onClose}>
                Cancel
              </Button>
              <Button onPress={handleSaveProfile} isLoading={isLoading}>
                Save
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ProfileScreen;