import React from 'react';
import { Box, Text, VStack, HStack } from 'native-base';

interface PieChartProps {
  data: Array<{ x: string; y: number }>;
  title?: string;
  height?: number;
  colorScale?: string[];
  showTooltip?: boolean;
  animate?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  height = 250,
  colorScale = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
}) => {
  const total = data.reduce((sum, item) => sum + item.y, 0);
  
  return (
    <Box bg="white" rounded="lg" shadow={2} p={4}>
      {title && (
        <Text fontSize="lg" fontWeight="bold" mb={2} color="gray.800">
          {title}
        </Text>
      )}
      <Box height={height} justifyContent="center">
        <VStack space={3}>
          {/* Legend */}
          <VStack space={2}>
            {data.map((item, index) => {
              const percentage = ((item.y / total) * 100).toFixed(1);
              const color = colorScale[index % colorScale.length];
              
              return (
                <HStack key={index} alignItems="center" justifyContent="space-between">
                  <HStack alignItems="center" space={2}>
                    <Box w="4" h="4" bg={color} rounded="sm" />
                    <Text fontSize="sm" color="gray.700">
                      {item.x}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                    {percentage}%
                  </Text>
                </HStack>
              );
            })}
          </VStack>
          
          {/* Simple bar representation */}
          <Box bg="gray.100" rounded="md" p={2}>
            <HStack space={0} rounded="md" overflow="hidden">
              {data.map((item, index) => {
                const percentage = (item.y / total) * 100;
                const color = colorScale[index % colorScale.length];
                
                return (
                  <Box
                    key={index}
                    bg={color}
                    height="20px"
                    width={`${percentage}%`}
                  />
                );
              })}
            </HStack>
          </Box>
          
          <Text fontSize="xs" color="gray.500" textAlign="center">
            Total: {total.toLocaleString()}
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};