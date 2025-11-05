import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  VStack,
  HStack,
  ScrollView,
  Heading,
  FormControl,
  Input,
  Button,
  IconButton,
  Text,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import ThemedSafeAreaView from '../../components/common/ThemedSafeAreaView';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../hooks/useProfile';
import { spacing, fontSizes } from '../../utils/responsive';

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { isLoading, changePassword } = useProfile();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const success = await changePassword(formData.currentPassword, formData.newPassword);
      if (success) {
        navigation.goBack();
      }
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ScrollView flex={1} bg={colors.background}>
        <VStack space={spacing.lg} p={spacing.md}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center">
            <Heading size="lg" color={colors.text}>Change Password</Heading>
            <IconButton
              icon={<Ionicons name="close" size={24} color={colors.text} />}
              onPress={() => navigation.goBack()}
            />
          </HStack>

          {/* Security Notice */}
          <VStack 
            space={spacing.sm} 
            p={spacing.md} 
            bg={colors.surface} 
            borderRadius="md"
            borderLeftWidth={4}
            borderLeftColor={colors.primary}
          >
            <HStack alignItems="center" space={spacing.sm}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <Text fontSize={fontSizes.md} fontWeight="600" color={colors.text}>
                Security Tips
              </Text>
            </HStack>
            <Text fontSize={fontSizes.sm} color={colors.textSecondary}>
              • Use a strong password with at least 8 characters{'\n'}
              • Include uppercase, lowercase, numbers, and symbols{'\n'}
              • Don't reuse passwords from other accounts{'\n'}
              • Consider using a password manager
            </Text>
          </VStack>

          {/* Password Form */}
          <VStack space={spacing.md}>
            <FormControl isRequired isInvalid={!!errors.currentPassword}>
              <FormControl.Label>Current Password</FormControl.Label>
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChangeText={(value) => updateField('currentPassword', value)}
                placeholder="Enter your current password"
                InputRightElement={
                  <IconButton
                    icon={
                      <Ionicons 
                        name={showPasswords.current ? 'eye-off' : 'eye'} 
                        size={20} 
                        color={colors.textSecondary} 
                      />
                    }
                    onPress={() => togglePasswordVisibility('current')}
                  />
                }
              />
              <FormControl.ErrorMessage>{errors.currentPassword}</FormControl.ErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.newPassword}>
              <FormControl.Label>New Password</FormControl.Label>
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChangeText={(value) => updateField('newPassword', value)}
                placeholder="Enter your new password"
                InputRightElement={
                  <IconButton
                    icon={
                      <Ionicons 
                        name={showPasswords.new ? 'eye-off' : 'eye'} 
                        size={20} 
                        color={colors.textSecondary} 
                      />
                    }
                    onPress={() => togglePasswordVisibility('new')}
                  />
                }
              />
              <FormControl.ErrorMessage>{errors.newPassword}</FormControl.ErrorMessage>
              <FormControl.HelperText>
                Password must be at least 6 characters long
              </FormControl.HelperText>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.confirmPassword}>
              <FormControl.Label>Confirm New Password</FormControl.Label>
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                placeholder="Confirm your new password"
                InputRightElement={
                  <IconButton
                    icon={
                      <Ionicons 
                        name={showPasswords.confirm ? 'eye-off' : 'eye'} 
                        size={20} 
                        color={colors.textSecondary} 
                      />
                    }
                    onPress={() => togglePasswordVisibility('confirm')}
                  />
                }
              />
              <FormControl.ErrorMessage>{errors.confirmPassword}</FormControl.ErrorMessage>
            </FormControl>
          </VStack>

          {/* Action Buttons */}
          <VStack space={spacing.sm} mt={spacing.lg}>
            <Button
              onPress={handleSubmit}
              isLoading={isLoading}
              colorScheme="primary"
              leftIcon={<Ionicons name="lock-closed" size={16} />}
            >
              Change Password
            </Button>
            
            <Button
              variant="outline"
              onPress={() => navigation.goBack()}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
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
});

export default ChangePasswordScreen;