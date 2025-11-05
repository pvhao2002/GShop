import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { RootState } from '../store';
import {
  setProfile,
  updateProfile as updateProfileAction,
  setAddresses,
  addAddress,
  updateAddress as updateAddressAction,
  removeAddress,
  setDefaultAddress as setDefaultAddressAction,
  setNotificationPreferences,
  updateNotificationPreferences as updateNotificationPreferencesAction,
  setLoading,
  setError,
  clearError,
} from '../store/slices/userSlice';
import userService, { 
  UpdateProfileRequest, 
  CreateAddressRequest, 
  UpdateAddressRequest,
  NotificationPreferences 
} from '../services/userService';

export const useProfile = () => {
  const dispatch = useDispatch();
  const { 
    profile, 
    addresses, 
    notificationPreferences, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.user);

  // Load initial profile data
  const loadProfile = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const profileData = await userService.getProfile();
      dispatch(setProfile(profileData));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load profile';
      dispatch(setError(errorMessage));
      Alert.alert('Error', errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Update profile
  const updateProfile = async (data: UpdateProfileRequest) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const updatedProfile = await userService.updateProfile(data);
      dispatch(updateProfileAction(updatedProfile));
      
      Alert.alert('Success', 'Profile updated successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      dispatch(setError(errorMessage));
      Alert.alert('Error', errorMessage);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Load addresses
  const loadAddresses = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const addressData = await userService.getAddresses();
      dispatch(setAddresses(addressData));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load addresses';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Create address
  const createAddress = async (data: CreateAddressRequest) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const newAddress = await userService.createAddress(data);
      dispatch(addAddress(newAddress));
      
      Alert.alert('Success', 'Address added successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add address';
      dispatch(setError(errorMessage));
      Alert.alert('Error', errorMessage);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Update address
  const updateAddress = async (id: string, data: UpdateAddressRequest) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const updatedAddress = await userService.updateAddress(id, data);
      dispatch(updateAddressAction({ id, data: updatedAddress }));
      
      Alert.alert('Success', 'Address updated successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update address';
      dispatch(setError(errorMessage));
      Alert.alert('Error', errorMessage);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Delete address
  const deleteAddress = async (id: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      await userService.deleteAddress(id);
      dispatch(removeAddress(id));
      
      Alert.alert('Success', 'Address deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete address';
      dispatch(setError(errorMessage));
      Alert.alert('Error', errorMessage);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Set default address
  const setDefaultAddress = async (id: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      await userService.setDefaultAddress(id);
      dispatch(setDefaultAddressAction(id));
      
      Alert.alert('Success', 'Default address updated');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to set default address';
      dispatch(setError(errorMessage));
      Alert.alert('Error', errorMessage);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Load notification preferences
  const loadNotificationPreferences = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const preferences = await userService.getNotificationPreferences();
      dispatch(setNotificationPreferences(preferences));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load notification preferences';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Update notification preferences
  const updateNotificationPreferences = async (preferences: Partial<NotificationPreferences>) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const updatedPreferences = await userService.updateNotificationPreferences(preferences);
      dispatch(updateNotificationPreferencesAction(updatedPreferences));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update notification preferences';
      dispatch(setError(errorMessage));
      Alert.alert('Error', errorMessage);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      await userService.changePassword(currentPassword, newPassword);
      
      Alert.alert('Success', 'Password changed successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to change password';
      dispatch(setError(errorMessage));
      Alert.alert('Error', errorMessage);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    // State
    profile,
    addresses,
    notificationPreferences,
    isLoading,
    error,
    
    // Actions
    loadProfile,
    updateProfile,
    loadAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    loadNotificationPreferences,
    updateNotificationPreferences,
    changePassword,
    clearError: () => dispatch(clearError()),
  };
};