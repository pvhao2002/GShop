import React from 'react';
import { Alert, VStack, Text, Button } from 'native-base';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <VStack space={4} alignItems="center" p={4}>
      <Alert status="error" w="100%">
        <Alert.Icon />
        <Text fontSize="md" fontWeight="medium" color="error.600">
          {message}
        </Text>
      </Alert>
      {onRetry && (
        <Button onPress={onRetry} variant="outline" colorScheme="error">
          Try Again
        </Button>
      )}
    </VStack>
  );
};