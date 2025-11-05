import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Pressable,
  Box,
  Badge,
} from 'native-base';

interface VariantSelectorProps {
  sizes: string[];
  colors: string[];
  selectedSize: string | null;
  selectedColor: string | null;
  onSizeSelect: (size: string) => void;
  onColorSelect: (color: string) => void;
  stockQuantity: number;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  sizes,
  colors,
  selectedSize,
  selectedColor,
  onSizeSelect,
  onColorSelect,
  stockQuantity,
}) => {
  const getColorValue = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#10b981',
      yellow: '#f59e0b',
      purple: '#8b5cf6',
      pink: '#ec4899',
      black: '#1f2937',
      white: '#f9fafb',
      gray: '#6b7280',
      brown: '#92400e',
      orange: '#f97316',
    };
    
    return colorMap[colorName.toLowerCase()] || '#6b7280';
  };

  return (
    <VStack space={4}>
      {/* Size Selection */}
      {sizes.length > 0 && (
        <VStack space={2}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="md" fontWeight="semibold" color="gray.800">
              Size
            </Text>
            {selectedSize && (
              <Badge colorScheme="primary" variant="subtle">
                {selectedSize}
              </Badge>
            )}
          </HStack>
          
          <HStack space={2} flexWrap="wrap">
            {sizes.map((size) => (
              <Pressable
                key={size}
                onPress={() => onSizeSelect(size)}
                disabled={stockQuantity === 0}
                _pressed={{ opacity: 0.7 }}
              >
                <Box
                  px={4}
                  py={2}
                  minWidth={12}
                  borderWidth={1}
                  borderColor={selectedSize === size ? 'primary.500' : 'gray.300'}
                  bg={selectedSize === size ? 'primary.50' : 'white'}
                  rounded="md"
                  alignItems="center"
                  opacity={stockQuantity === 0 ? 0.5 : 1}
                >
                  <Text
                    fontSize="sm"
                    fontWeight={selectedSize === size ? 'semibold' : 'normal'}
                    color={selectedSize === size ? 'primary.600' : 'gray.700'}
                  >
                    {size}
                  </Text>
                </Box>
              </Pressable>
            ))}
          </HStack>
        </VStack>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <VStack space={2}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="md" fontWeight="semibold" color="gray.800">
              Color
            </Text>
            {selectedColor && (
              <Badge colorScheme="primary" variant="subtle">
                {selectedColor}
              </Badge>
            )}
          </HStack>
          
          <HStack space={3} flexWrap="wrap">
            {colors.map((color) => (
              <Pressable
                key={color}
                onPress={() => onColorSelect(color)}
                disabled={stockQuantity === 0}
                _pressed={{ opacity: 0.7 }}
              >
                <VStack alignItems="center" space={1}>
                  <Box
                    width={10}
                    height={10}
                    rounded="full"
                    bg={getColorValue(color)}
                    borderWidth={selectedColor === color ? 3 : 2}
                    borderColor={selectedColor === color ? 'primary.500' : 'gray.300'}
                    opacity={stockQuantity === 0 ? 0.5 : 1}
                  />
                  <Text
                    fontSize="xs"
                    color={selectedColor === color ? 'primary.600' : 'gray.600'}
                    fontWeight={selectedColor === color ? 'semibold' : 'normal'}
                    textTransform="capitalize"
                  >
                    {color}
                  </Text>
                </VStack>
              </Pressable>
            ))}
          </HStack>
        </VStack>
      )}

      {/* Stock Information */}
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontSize="sm" color="gray.600">
          Stock Available
        </Text>
        <Badge
          colorScheme={stockQuantity > 10 ? 'green' : stockQuantity > 0 ? 'yellow' : 'red'}
          variant="solid"
        >
          {stockQuantity > 0 ? `${stockQuantity} items` : 'Out of Stock'}
        </Badge>
      </HStack>
    </VStack>
  );
};

export default VariantSelector;