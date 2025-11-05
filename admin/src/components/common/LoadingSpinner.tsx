import React from 'react';
import { Spinner, Center, Text } from 'native-base';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'lg' 
}) => {
  return (
    <Center flex={1}>
      <Spinner size={size} color="primary.500" />
      <Text mt={2} fontSize="md" color="gray.600">
        {message}
      </Text>
    </Center>
  );
};