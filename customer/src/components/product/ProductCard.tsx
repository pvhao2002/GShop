import React from 'react';
import {
  Box,
  Image,
  Text,
  Pressable,
  HStack,
  VStack,
  Badge,
  IconButton,
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../services/productService';
import { addToFavorites, removeFromFavorites } from '../../store/slices/productSlice';
import { RootState } from '../../store';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { StackNavigationProp } from '@react-navigation/stack';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

type NavigationProp = StackNavigationProp<MainStackParamList>;

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.product.favorites);
  
  const isFavorite = favorites.includes(product.id);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('ProductDetail', { productId: product.id });
    }
  };

  const handleFavoritePress = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(product.id));
    } else {
      dispatch(addToFavorites(product.id));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Pressable onPress={handlePress} flex={1} _pressed={{ opacity: 0.8 }}>
      <Box
        bg="white"
        rounded="lg"
        shadow={2}
        m={2}
        overflow="hidden"
      >
        <Box position="relative">
          <Image
            source={{
              uri: product.images[0] || 'https://via.placeholder.com/200x200?text=No+Image'
            }}
            alt={product.name}
            height={200}
            width="100%"
            resizeMode="cover"
          />
          
          {/* Favorite Button */}
          <IconButton
            position="absolute"
            top={2}
            right={2}
            icon={
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#e53e3e' : '#666'}
              />
            }
            bg="white"
            rounded="full"
            size="sm"
            onPress={handleFavoritePress}
            _pressed={{ bg: 'gray.100' }}
          />

          {/* Stock Badge */}
          {product.stockQuantity === 0 && (
            <Badge
              position="absolute"
              bottom={2}
              left={2}
              colorScheme="red"
              variant="solid"
            >
              Out of Stock
            </Badge>
          )}
        </Box>

        <VStack p={3} space={2}>
          <Text
            fontSize="md"
            fontWeight="semibold"
            numberOfLines={2}
            color="gray.800"
          >
            {product.name}
          </Text>
          
          <Text
            fontSize="sm"
            color="gray.600"
            numberOfLines={2}
          >
            {product.description}
          </Text>

          <HStack justifyContent="space-between" alignItems="center">
            <Text
              fontSize="lg"
              fontWeight="bold"
              color="primary.600"
            >
              {formatPrice(product.price)}
            </Text>
            
            {product.stockQuantity > 0 && (
              <Text fontSize="xs" color="gray.500">
                Stock: {product.stockQuantity}
              </Text>
            )}
          </HStack>

          {/* Size and Color indicators */}
          <HStack space={2} alignItems="center">
            {product.sizes.length > 0 && (
              <HStack space={1} alignItems="center">
                <Text fontSize="xs" color="gray.500">Sizes:</Text>
                <Text fontSize="xs" color="gray.700">
                  {product.sizes.slice(0, 3).join(', ')}
                  {product.sizes.length > 3 && '...'}
                </Text>
              </HStack>
            )}
          </HStack>
        </VStack>
      </Box>
    </Pressable>
  );
};

export default ProductCard;