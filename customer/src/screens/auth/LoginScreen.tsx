import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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
import { validateEmail, validateRequired } from '../../utils/validation';
import { RootState, AppDispatch } from '../../store';
import { loginStart, loginSuccess, loginFailure, clearError } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;
type LoginScreenRouteProp = RouteProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<LoginScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Clear error when component mounts
    dispatch(clearError());
    
    // Check for success message from route params
    if (route.params?.message) {
      setSuccessMessage(route.params.message);
    }
  }, [dispatch, route.params]);

  const validateForm = (): boolean => {
    const errors = {
      email: '',
      password: '',
    };

    if (!validateRequired(formData.email)) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!validateRequired(formData.password)) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    dispatch(loginStart());
    
    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });
      
      dispatch(loginSuccess(response));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Login failed. Please try again.';
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
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to your account
            </Text>

            {successMessage && (
              <Alert w="100%" status="success" style={styles.alert}>
                <VStack space={2} flexShrink={1} w="100%">
                  <HStack flexShrink={1} space={2} alignItems="center">
                    <Alert.Icon />
                    <NBText fontSize="md" color="success.600" flexShrink={1}>
                      {successMessage}
                    </NBText>
                  </HStack>
                </VStack>
                <IconButton
                  variant="unstyled"
                  _focus={{ borderWidth: 0 }}
                  icon={<CloseIcon size="3" />}
                  _icon={{ color: "success.600" }}
                  onPress={() => setSuccessMessage('')}
                />
              </Alert>
            )}

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

              <Button
                onPress={handleLogin}
                isLoading={isLoading}
                isLoadingText="Signing in..."
                style={styles.loginButton}
              >
                Sign In
              </Button>

              <HStack justifyContent="center" style={styles.forgotPasswordLink}>
                <Link
                  onPress={() => navigation.navigate('ForgotPassword')}
                  _text={{ color: colors.primary, fontWeight: 'medium' }}
                >
                  Forgot Password?
                </Link>
              </HStack>

              <HStack justifyContent="center" style={styles.registerLink}>
                <Text style={[styles.registerText, { color: colors.textSecondary }]}>
                  Don't have an account?{' '}
                </Text>
                <Link
                  onPress={() => navigation.navigate('Register')}
                  _text={{ color: colors.primary, fontWeight: 'medium' }}
                >
                  Sign Up
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
  loginButton: {
    marginTop: spacing.md,
  },
  forgotPasswordLink: {
    marginTop: spacing.md,
  },
  registerLink: {
    marginTop: spacing.lg,
  },
  registerText: {
    fontSize: fontSizes.sm,
  },
});

export default LoginScreen;