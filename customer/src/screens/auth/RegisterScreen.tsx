import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { 
  VStack, 
  FormControl, 
  Input, 
  Button, 
  Link, 
  HStack, 
  Alert,
  CloseIcon,
  IconButton,
  Text as NBText
} from 'native-base';
import ThemedSafeAreaView from '../../components/common/ThemedSafeAreaView';
import { useTheme } from '../../context/ThemeContext';
import { fontSizes, spacing } from '../../utils/responsive';
import { validateEmail, validatePassword, validatePhone, validateRequired } from '../../utils/validation';
import { RootState, AppDispatch } from '../../store';
import { loginStart, loginSuccess, loginFailure, clearError } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Clear error when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const validateForm = (): boolean => {
    const errors = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    };

    if (!validateRequired(formData.firstName)) {
      errors.firstName = 'First name is required';
    }

    if (!validateRequired(formData.lastName)) {
      errors.lastName = 'Last name is required';
    }

    if (!validateRequired(formData.email)) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!validateRequired(formData.password)) {
      errors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message || 'Invalid password';
      }
    }

    if (!validateRequired(formData.confirmPassword)) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    dispatch(loginStart());
    
    try {
      const response = await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      });
      
      dispatch(loginSuccess(response));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Registration failed. Please try again.';
      dispatch(loginFailure(errorMessage));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign up to get started
            </Text>

            {error && (
              <Alert w="100%" status="error" style={styles.alert}>
                <VStack space={2} flexShrink={1} w="100%">
                  <HStack flexShrink={1} space={2} alignItems="center">
                    <Alert.Icon />
                    <NBText fontSize="md" color="error.600" flexShrink={1}>
                      {error}
                    </NBText>
                  </HStack>
                </VStack>
                <IconButton
                  variant="unstyled"
                  _focus={{ borderWidth: 0 }}
                  icon={<CloseIcon size="3" />}
                  _icon={{ color: "error.600" }}
                  onPress={() => dispatch(clearError())}
                />
              </Alert>
            )}

            <VStack space={4} style={styles.form}>
              <HStack space={2}>
                <FormControl flex={1} isInvalid={!!formErrors.firstName}>
                  <FormControl.Label>First Name</FormControl.Label>
                  <Input
                    placeholder="First name"
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                    autoCapitalize="words"
                  />
                  <FormControl.ErrorMessage>
                    {formErrors.firstName}
                  </FormControl.ErrorMessage>
                </FormControl>

                <FormControl flex={1} isInvalid={!!formErrors.lastName}>
                  <FormControl.Label>Last Name</FormControl.Label>
                  <Input
                    placeholder="Last name"
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                    autoCapitalize="words"
                  />
                  <FormControl.ErrorMessage>
                    {formErrors.lastName}
                  </FormControl.ErrorMessage>
                </FormControl>
              </HStack>

              <FormControl isInvalid={!!formErrors.email}>
                <FormControl.Label>Email</FormControl.Label>
                <Input
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <FormControl.ErrorMessage>
                  {formErrors.email}
                </FormControl.ErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!formErrors.phone}>
                <FormControl.Label>Phone (Optional)</FormControl.Label>
                <Input
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  keyboardType="phone-pad"
                />
                <FormControl.ErrorMessage>
                  {formErrors.phone}
                </FormControl.ErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!formErrors.password}>
                <FormControl.Label>Password</FormControl.Label>
                <Input
                  placeholder="Enter your password"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <FormControl.ErrorMessage>
                  {formErrors.password}
                </FormControl.ErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!formErrors.confirmPassword}>
                <FormControl.Label>Confirm Password</FormControl.Label>
                <Input
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <FormControl.ErrorMessage>
                  {formErrors.confirmPassword}
                </FormControl.ErrorMessage>
              </FormControl>

              <Button
                onPress={handleRegister}
                isLoading={isLoading}
                isLoadingText="Creating account..."
                style={styles.registerButton}
              >
                Create Account
              </Button>

              <HStack justifyContent="center" style={styles.loginLink}>
                <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                  Already have an account?{' '}
                </Text>
                <Link
                  onPress={() => navigation.navigate('Login')}
                  _text={{ color: colors.primary, fontWeight: 'medium' }}
                >
                  Sign In
                </Link>
              </HStack>
            </VStack>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  alert: {
    marginBottom: spacing.md,
  },
  form: {
    width: '100%',
  },
  registerButton: {
    marginTop: spacing.md,
  },
  loginLink: {
    marginTop: spacing.lg,
  },
  loginText: {
    fontSize: fontSizes.sm,
  },
});

export default RegisterScreen;