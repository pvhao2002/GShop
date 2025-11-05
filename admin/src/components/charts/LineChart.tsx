import React from 'react';
import { Box, Text, HStack, VStack } from 'native-base';

interface LineChartProps {
  data: Array<{ x: string | number; y: number }>;
  title?: string;
  height?: number;
  color?: string;
  showTooltip?: boolean;
  animate?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  height = 200,
  color = '#3B82F6',
}) => {
  // Simple fallback chart implementation
  const maxValue = Math.max(...data.map(d => d.y));
  const minValue = Math.min(...data.map(d => d.y));
  
  return (
    <Box bg="white" rounded="lg" shadow={2} p={4}>
      {title && (
        <Text fontSize="lg" fontWeight="bold" mb={2} color="gray.800">
          {title}
        </Text>
      )}
      <Box height={height} justifyContent="center">
        <VStack space={2}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="xs" color="gray.500">Max: {maxValue.toLocaleString()}</Text>
            <Text fontSize="xs" color="gray.500">Min: {minValue.toLocaleString()}</Text>
          </HStack>
          
          <Box bg="gray.100" rounded="md" p={3}>
            <HStack space={1} alignItems="end" justifyContent="space-between">
              {data.map((point, index) => {
                const barHeight = ((point.y - minValue) / (maxValue - minValue)) * 80 + 20;
                return (
                  <VStack key={index} alignItems="center" flex={1}>
                    <Box
                      bg={color}
                      width="8px"
                      height={`${barHeight}px`}
                      rounded="sm"
                    />
                    <Text fontSize="xs" color="gray.600" mt={1}>
                      {point.x}
                    </Text>
                  </VStack>
                );
              })}
            </HStack>
          </Box>
          
          <Text fontSize="xs" color="gray.500" textAlign="center">
            Data points: {data.length} | Range: {minValue.toLocaleString()} - {maxValue.toLocaleString()}
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};