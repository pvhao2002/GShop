import React from 'react';
import { Box, VStack, HStack, Text } from 'native-base';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary.500',
  trend
}) => {
  return (
    <Box
      bg="white"
      rounded="lg"
      shadow={2}
      p={4}
      flex={1}
      mx={1}
    >
      <VStack space={2}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            {title}
          </Text>
          <Ionicons name={icon} size={20} color={color} />
        </HStack>
        
        <Text fontSize="2xl" fontWeight="bold" color="gray.800">
          {value}
        </Text>
        
        {trend && (
          <HStack alignItems="center" space={1}>
            <Ionicons 
              name={trend.isPositive ? 'trending-up' : 'trending-down'} 
              size={16} 
              color={trend.isPositive ? '#10B981' : '#EF4444'} 
            />
            <Text 
              fontSize="xs" 
              color={trend.isPositive ? 'green.500' : 'red.500'}
              fontWeight="medium"
            >
              {Math.abs(trend.value)}%
            </Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );
};