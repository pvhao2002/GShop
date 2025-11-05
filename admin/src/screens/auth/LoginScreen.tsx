import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  Center,
  Alert,
  KeyboardAvoidingView,
  ScrollView
} from 'native-base';
import { Platform } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Center flex={1} bg="gray.50" px={4}>
          <Box w="100%" maxW="400px">
            <VStack space={6} alignItems="center">
              {/* Logo/Title */}
              <VStack space={2} alignItems="center">
                <Text fontSize="3xl" fontWeight="bold" color="primary.600">
                  Admin Portal
                </Text>
                <Text fontSize="md" color="gray.600" textAlign="center">
                  Sign in to manage your e-commerce platform
                </Text>
              </VStack>

              {/* Login Form */}
              <VStack space={4} w="100%">
                {error ? (
                  <Alert status="error">
                    <Alert.Icon />
                    <Text fontSize="sm" color="error.600">
                      {error}
                    </Text>
                  </Alert>
                ) : null}

                <Input
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  size="lg"
                />

                <Input
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  type="password"
                  size="lg"
                />

                <Button
                  onPress={handleLogin}
                  isLoading={isLoading}
                  isLoadingText="Signing in..."
                  size="lg"
                  colorScheme="primary"
                >
                  Sign In
                </Button>
              </VStack>
            </VStack>
          </Box>
        </Center>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};