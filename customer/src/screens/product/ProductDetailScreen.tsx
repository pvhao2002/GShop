import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Divider,
  IconButton,
  useToast,
  Spinner,
  Center,
} from 'native-base';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { RootState } from '../../store';
import { 
  setSelectedProduct, 
  setRelatedProducts, 
  setLoading, 
  setError,
  addToFavorites,
  removeFromFavorites 
} from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import productService from '../../services/productService';
import {
  ProductImageCarousel,
  VariantSelector,
  ProductCard,
} from '../../components/product';
import { ThemedSafeAreaView } from '../../components/common';

type ProductDetailRouteProp = RouteProp<MainStackParamList, 'ProductDetail'>;

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();
  
  const { productId } = route.params;
  const { selectedProduct, relatedProducts, isLoading, favorites } = useSelector(
    (state: RootState) => state.product
  );

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const isFavorite = selectedProduct ? favorites.includes(selectedProduct.id) : false;

  useEffect(() => {
    loadProductDetail();
  }, [productId]);

  const loadProductDetail = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const [product, related] = await Promise.all([
        productService.getProductById(productId),
        productService.getRelatedProducts(productId, 4)
      ]);

      dispatch(setSelectedProduct(product));
      dispatch(setRelatedProducts(related));

      // Auto-select first available size and color
      if (product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
    } catch (error) {
      console.error('Error loading product detail:', error);
      dispatch(setError('Failed to load product details'));
      toast.show({
        title: 'Error',
        description: 'Failed to load product details',
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    if (selectedProduct.stockQuantity === 0) {
      toast.show({
        title: 'Out of Stock',
        description: 'This product is currently out of stock',
      });
      return;
    }

    // Validate variant selection if variants exist
    if (selectedProduct.sizes.length > 0 && !selectedSize) {
      toast.show({
        title: 'Size Required',
        description: 'Please select a size',
      });
      return;
    }

    if (selectedProduct.colors.length > 0 && !selectedColor) {
      toast.show({
        title: 'Color Required',
        description: 'Please select a color',
      });
      return;
    }

    const cartItem = {
      id: `${selectedProduct.id}-${selectedSize || 'default'}-${selectedColor || 'default'}`,
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: selectedProduct.images[0],
      selectedSize: selectedSize || undefined,
      selectedColor: selectedColor || undefined,
      quantity,
    };

    dispatch(addToCart(cartItem));
    
    toast.show({
      title: 'Added to Cart',
      description: `${selectedProduct.name} has been added to your cart`,
    });
  };

  const handleFavoriteToggle = () => {
    if (!selectedProduct) return;

    if (isFavorite) {
      dispatch(removeFromFavorites(selectedProduct.id));
      toast.show({
        title: 'Removed from Favorites',
        description: `${selectedProduct.name} removed from favorites`,
      });
    } else {
      dispatch(addToFavorites(selectedProduct.id));
      toast.show({
        title: 'Added to Favorites',
        description: `${selectedProduct.name} added to favorites`,
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (isLoading) {
    return (
      <ThemedSafeAreaView>
        <Center flex={1}>
          <Spinner size="lg" />
          <Text mt={2}>Loading product details...</Text>
        </Center>
      </ThemedSafeAreaView>
    );
  }

  if (!selectedProduct) {
    return (
      <ThemedSafeAreaView>
        <Center flex={1}>
          <Text>Product not found</Text>
          <Button mt={4} onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </Center>
      </ThemedSafeAreaView>
    );
  }

  return (
    <ThemedSafeAreaView>
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <ProductImageCarousel
          images={selectedProduct.images}
          productName={selectedProduct.name}
        />

        <VStack space={4} p={4}>
          {/* Product Info */}
          <VStack space={2}>
            <HStack justifyContent="space-between" alignItems="flex-start">
              <VStack flex={1} space={1}>
                <Text fontSize="xl" fontWeight="bold" color="gray.800">
                  {selectedProduct.name}
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="primary.600">
                  {formatPrice(selectedProduct.price)}
                </Text>
              </VStack>
              
              <IconButton
                icon={
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFavorite ? '#e53e3e' : '#666'}
                  />
                }
                onPress={handleFavoriteToggle}
                bg="gray.100"
                rounded="full"
                _pressed={{ bg: 'gray.200' }}
              />
            </HStack>

            <Text fontSize="md" color="gray.600" lineHeight="md">
              {selectedProduct.description}
            </Text>
          </VStack>

          <Divider />

          {/* Variant Selection */}
          <VariantSelector
            sizes={selectedProduct.sizes}
            colors={selectedProduct.colors}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
            onSizeSelect={setSelectedSize}
            onColorSelect={setSelectedColor}
            stockQuantity={selectedProduct.stockQuantity}
          />

          <Divider />

          {/* Quantity Selection */}
          <VStack space={2}>
            <Text fontSize="md" fontWeight="semibold" color="gray.800">
              Quantity
            </Text>
            <HStack space={3} alignItems="center">
              <IconButton
                icon={<Ionicons name="remove" size={20} />}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                isDisabled={quantity <= 1}
                bg="gray.100"
                rounded="md"
                size="sm"
              />
              <Text fontSize="lg" fontWeight="semibold" minWidth={8} textAlign="center">
                {quantity}
              </Text>
              <IconButton
                icon={<Ionicons name="add" size={20} />}
                onPress={() => setQuantity(Math.min(selectedProduct.stockQuantity, quantity + 1))}
                isDisabled={quantity >= selectedProduct.stockQuantity}
                bg="gray.100"
                rounded="md"
                size="sm"
              />
            </HStack>
          </VStack>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            onPress={handleAddToCart}
            isDisabled={selectedProduct.stockQuantity === 0}
            leftIcon={<Ionicons name="cart" size={20} color="white" />}
          >
            {selectedProduct.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <VStack space={3} mt={4}>
              <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                Related Products
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space={3} px={1}>
                  {relatedProducts.map((product) => (
                    <Box key={product.id} width={200}>
                      <ProductCard product={product} />
                    </Box>
                  ))}
                </HStack>
              </ScrollView>
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </ThemedSafeAreaView>
  );
};

export default ProductDetailScreen;