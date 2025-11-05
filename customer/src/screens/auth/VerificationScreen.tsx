import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { 
  VStack, 
  HStack,
  Input, 
  Button, 
  Link, 
  Alert,
  CloseIcon,
  IconButton,
  Text as NBText
} from 'native-base';
import ThemedSafeAreaView from '../../components/common/ThemedSafeAreaView';
import { useTheme } from '../../context/ThemeContext';
import { fontSizes, spacing } from '../../utils/responsive';
import api from '../../services/api';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type VerificationScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Verification'>;
type VerificationScreenRouteProp = RouteProp<AuthStackParamList, 'Verification'>;

const VerificationScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<VerificationScreenNavigationProp>();
  const route = useRoute<VerificationScreenRouteProp>();
  
  const { email } = route.params;
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef<Array<any>>([]);

  useEffect(() => {
    // Start cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Please enter the complete verification code');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await api.post('/auth/verify-email', {
        email,
        code: verificationCode,
      });
      
      // Navigate back to login with success message
      navigation.navigate('Login', { 
        message: 'Email verified successfully! You can now sign in.' 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Invalid verification code. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError('');
    
    try {
      await api.post('/auth/resend-verification', { email });
      setResendCooldown(60); // 60 seconds cooldown
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to resend verification code. Please try again.';
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Verify Your Email</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We've sent a 6-digit verification code to {email}
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

          <VStack space={6} style={styles.form}>
            <HStack space={3} justifyContent="center">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  value={digit}
                  onChangeText={(value) => handleCodeChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  maxLength={1}
                  keyboardType="numeric"
                  textAlign="center"
                  fontSize="lg"
                  fontWeight="bold"
                  style={styles.codeInput}
                />
              ))}
            </HStack>

            <Button
              onPress={handleVerify}
              isLoading={isLoading}
              isLoadingText="Verifying..."
              isDisabled={code.join('').length !== 6}
            >
              Verify Email
            </Button>

            <VStack space={2} alignItems="center">
              <Text style={[styles.resendText, { color: colors.textSecondary }]}>
                Didn't receive the code?
              </Text>
              
              {resendCooldown > 0 ? (
                <Text style={[styles.cooldownText, { color: colors.textSecondary }]}>
                  Resend in {resendCooldown}s
                </Text>
              ) : (
                <Button
                  variant="link"
                  onPress={handleResendCode}
                  isDisabled={resendLoading}
                  _text={{ color: colors.primary, fontWeight: 'medium' }}
                >
                  {resendLoading ? 'Sending...' : 'Resend Code'}
                </Button>
              )}
            </VStack>

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
    lineHeight: 22,
  },
  alert: {
    marginBottom: spacing.md,
  },
  form: {
    width: '100%',
  },
  codeInput: {
    width: 45,
    height: 50,
  },
  resendText: {
    fontSize: fontSizes.sm,
  },
  cooldownText: {
    fontSize: fontSizes.sm,
    fontStyle: 'italic',
  },
  backLink: {
    marginTop: spacing.lg,
  },
});

export default VerificationScreen;