import React from 'react';
import { Box, Text, HStack, VStack } from 'native-base';

interface BarChartProps {
  data: Array<{ x: string | number; y: number }>;
  title?: string;
  height?: number;
  color?: string;
  showTooltip?: boolean;
  animate?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 200,
  color = '#10B981',
}) => {
  const maxValue = Math.max(...data.map(d => d.y));
  
  return (
    <Box bg="white" rounded="lg" shadow={2} p={4}>
      {title && (
        <Text fontSize="lg" fontWeight="bold" mb={2} color="gray.800">
          {title}
        </Text>
      )}
      <Box height={height} justifyContent="center">
        <VStack space={2}>
          <Text fontSize="xs" color="gray.500" textAlign="right">
            Max: {maxValue.toLocaleString()}
          </Text>
          
          <Box bg="gray.100" rounded="md" p={3}>
            <HStack space={2} alignItems="end" justifyContent="space-between">
              {data.map((point, index) => {
                const barHeight = (point.y / maxValue) * 120 + 20;
                return (
                  <VStack key={index} alignItems="center" flex={1}>
                    <Text fontSize="xs" color="gray.700" mb={1}>
                      {point.y}
                    </Text>
                    <Box
                      bg={color}
                      width="20px"
                      height={`${barHeight}px`}
                      rounded="sm"
                    />
                    <Text fontSize="xs" color="gray.600" mt={1} textAlign="center">
                      {String(point.x).substring(0, 8)}
                    </Text>
                  </VStack>
                );
              })}
            </HStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};