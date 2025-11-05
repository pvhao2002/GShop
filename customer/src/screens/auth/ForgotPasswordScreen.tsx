import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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
import api from '../../services/api';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateForm = (): boolean => {
    if (!validateRequired(email)) {
      setEmailError('Email is required');
      return false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to send reset email. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError('');
    }
    if (error) {
      setError('');
    }
  };

  if (success) {
    return (
      <ThemedSafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Check Your Email</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We've sent a password reset link to {email}
          </Text>
          
          <VStack space={4} style={styles.form}>
            <Alert w="100%" status="success">
              <Alert.Icon />
              <NBText fontSize="md" color="success.600">
                Password reset email sent successfully!
              </NBText>
            </Alert>

            <Button
              onPress={() => navigation.navigate('Login')}
              variant="outline"
            >
              Back to Sign In
            </Button>
          </VStack>
        </View>
      </ThemedSafeAreaView>
    );
  }

  return (
    <ThemedSafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your email address and we'll send you a link to reset your password
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
                onPress={() => setError('')}
              />
            </Alert>
          )}

          <VStack space={4} style={styles.form}>
            <FormControl isInvalid={!!emailError}>
              <FormControl.Label>Email</FormControl.Label>
              <Input
                placeholder="Enter your email"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <FormControl.ErrorMessage>
                {emailError}
              </FormControl.ErrorMessage>
            </FormControl>

            <Button
              onPress={handleResetPassword}
              isLoading={isLoading}
              isLoadingText="Sending..."
            >
              Send Reset Link
            </Button>

            <HStack justifyContent="center" style={styles.backLink}>
              <Link
                onPress={() => navigation.navigate('Login')}
                _text={{ color: colors.primary, fontWeight: 'medium' }}
              >
                Back to Sign In
              </Link>
            </HStack>
          </VStack>
        </View>
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
  backLink: {
    marginTop: spacing.lg,
  },
});

export default ForgotPasswordScreen;