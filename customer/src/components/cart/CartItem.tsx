import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Image,
  Text,
  IconButton,
  Button,
  Pressable,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '../../services/cartService';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = (change: number) => {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Box
      bg="white"
      rounded="lg"
      shadow={1}
      p={4}
      mb={3}
    >
      <HStack space={3} alignItems="flex-start">
        {/* Product Image */}
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/80' }}
          alt={item.name}
          size="80px"
          rounded="md"
        />

        {/* Product Details */}
        <VStack flex={1} space={2}>
          <Text fontSize="md" fontWeight="medium" numberOfLines={2}>
            {item.name}
          </Text>

          {/* Variants */}
          <HStack space={4}>
            {item.selectedSize && (
              <Text fontSize="sm" color="gray.600">
                Size: {item.selectedSize}
              </Text>
            )}
            {item.selectedColor && (
              <Text fontSize="sm" color="gray.600">
                Color: {item.selectedColor}
              </Text>
            )}
          </HStack>

          {/* Price and Quantity */}
          <HStack justifyContent="space-between" alignItems="center">
            <VStack>
              <Text fontSize="lg" fontWeight="bold" color="primary.600">
                {formatPrice(item.price)}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Total: {formatPrice(item.price * item.quantity)}
              </Text>
            </VStack>

            {/* Quantity Controls */}
            <HStack alignItems="center" space={2}>
              <IconButton
                icon={<Ionicons name="remove" size={16} />}
                size="sm"
                variant="outline"
                onPress={() => handleQuantityChange(-1)}
                isDisabled={item.quantity <= 1}
              />
              
              <Text fontSize="md" fontWeight="medium" minW="8" textAlign="center">
                {item.quantity}
              </Text>
              
              <IconButton
                icon={<Ionicons name="add" size={16} />}
                size="sm"
                variant="outline"
                onPress={() => handleQuantityChange(1)}
                isDisabled={item.stockQuantity ? item.quantity >= item.stockQuantity : false}
              />
            </HStack>
          </HStack>

          {/* Stock Warning */}
          {item.stockQuantity && item.quantity >= item.stockQuantity && (
            <Text fontSize="xs" color="warning.600">
              Maximum stock reached
            </Text>
          )}
        </VStack>

        {/* Remove Button */}
        <IconButton
          icon={<Ionicons name="trash-outline" size={20} />}
          size="sm"
          variant="ghost"
          colorScheme="danger"
          onPress={() => onRemove(item.id)}
        />
      </HStack>
    </Box>
  );
};

export default CartItem;