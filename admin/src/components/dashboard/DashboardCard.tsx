import React from 'react';
import { Box, VStack, Text, Pressable } from 'native-base';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  onPress,
  children
}) => {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Box
        bg="white"
        rounded="lg"
        shadow={2}
        p={4}
        m={2}
      >
        <VStack space={2}>
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            {title}
          </Text>
          {subtitle && (
            <Text fontSize="sm" color="gray.600">
              {subtitle}
            </Text>
          )}
          {children}
        </VStack>
      </Box>
    </Pressable>
  );
};