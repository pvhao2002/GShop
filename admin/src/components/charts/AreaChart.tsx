import React from 'react';
import { Box, Text, HStack, VStack } from 'native-base';

interface AreaChartProps {
  data: Array<{ x: string | number; y: number }>;
  title?: string;
  height?: number;
  color?: string;
  showTooltip?: boolean;
  animate?: boolean;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  title,
  height = 200,
  color = '#3B82F6',
}) => {
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
            <Text fontSize="xs" color="gray.500">Avg: {Math.round(data.reduce((sum, d) => sum + d.y, 0) / data.length).toLocaleString()}</Text>
          </HStack>
          
          <Box bg="gray.100" rounded="md" p={3} position="relative">
            <HStack space={1} alignItems="end" justifyContent="space-between">
              {data.map((point, index) => {
                const barHeight = ((point.y - minValue) / (maxValue - minValue)) * 100 + 20;
                return (
                  <VStack key={index} alignItems="center" flex={1}>
                    <Box
                      bg={`${color}40`}
                      width="12px"
                      height={`${barHeight}px`}
                      rounded="sm"
                      borderTopWidth="2px"
                      borderTopColor={color}
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
            Trend over {data.length} periods
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};