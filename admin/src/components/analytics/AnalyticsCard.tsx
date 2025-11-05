import React from 'react';
import { Box, Text, HStack, VStack } from 'native-base';
import { Ionicons } from '@expo/vector-icons';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = '#3B82F6',
  trend,
  isLoading = false,
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Box bg="white" rounded="lg" shadow={2} p={4} flex={1}>
      <HStack justifyContent="space-between" alignItems="flex-start" mb={2}>
        <VStack flex={1}>
          <Text fontSize="sm" color="gray.500" fontWeight="medium">
            {title}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            {isLoading ? '...' : formatValue(value)}
          </Text>
          {subtitle && (
            <Text fontSize="xs" color="gray.400">
              {subtitle}
            </Text>
          )}
        </VStack>
        {icon && (
          <Box bg={`${color}20`} p={2} rounded="lg">
            <Ionicons name={icon} size={24} color={color} />
          </Box>
        )}
      </HStack>
      
      {trend && (
        <HStack alignItems="center" mt={2}>
          <Ionicons
            name={trend.isPositive ? 'trending-up' : 'trending-down'}
            size={16}
            color={trend.isPositive ? '#10B981' : '#EF4444'}
          />
          <Text
            fontSize="sm"
            color={trend.isPositive ? 'green.500' : 'red.500'}
            fontWeight="medium"
            ml={1}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </Text>
          <Text fontSize="sm" color="gray.500" ml={1}>
            vs last period
          </Text>
        </HStack>
      )}
    </Box>
  );
};