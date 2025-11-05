import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ScrollView,
  Alert,
  Spinner,
  Center,
  IconButton,
  useToast,
} from 'native-base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

import { RootState } from '../../store';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  loadCartFromStorage,
  syncCartWithBackend,
  validateCartStock,
} from '../../store/slices/cartSlice';
import { CartItem, OrderSummary } from '../../components/cart';
import { APP_CONFIG } from '../../config/app';

const CartScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();
  
  const { 
    items, 
    totalItems, 
    orderSummary, 
    isLoading, 
    isSyncing,
    validationErrors 
  } = useSelector((state: RootState) => state.cart);
  
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    loadCartData();
  }, []);

  useEffect(() => {
    if (isAuthenticated && isInitialized && items.length > 0) {
      // Sync cart with backend when user is authenticated
      dispatch(syncCartWithBackend() as any);
    }
  }, [isAuthenticated, isInitialized]);

  const loadCartData = async () => {
    try {
      const savedCart = await SecureStore.getItemAsync(APP_CONFIG.STORAGE_KEYS.CART_DATA);
      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        dispatch(loadCartFromStorage(cartItems));
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
    toast.show({
      description: 'Item removed from cart',
    });
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.show({
      description: 'Cart cleared',
    });
  };

  const handleProceedToCheckout = async () => {
    if (!isAuthenticated) {
      toast.show({
        description: 'Please login to proceed with checkout',
      });
      navigation.navigate('Auth' as never);
      return;
    }

    // Validate cart stock before proceeding
    dispatch(validateCartStock() as any);
    
    // Navigate to checkout if no validation errors
    if (validationErrors.length === 0) {
      navigation.navigate('Checkout' as never);
    }
  };

  if (!isInitialized) {
    return (
      <Center flex={1}>
        <Spinner size="lg" />
        <Text mt={2}>Loading cart...</Text>
      </Center>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Box flex={1} bg="gray.50">
          {/* Header */}
          <HStack
            bg="white"
            px={4}
            py={3}
            alignItems="center"
            justifyContent="space-between"
            shadow={1}
          >
            <Text fontSize="xl" fontWeight="bold">
              Shopping Cart
            </Text>
          </HStack>

          {/* Empty Cart */}
          <Center flex={1} px={6}>
            <Text fontSize="6xl" mb={4}>🛒</Text>
            <Text fontSize="xl" fontWeight="bold" mb={2} textAlign="center">
              Your cart is empty
            </Text>
            <Text fontSize="md" color="gray.600" mb={6} textAlign="center">
              Add some products to your cart to get started
            </Text>
            <Button
              onPress={() => navigation.navigate('Home' as never)}
              size="lg"
              width="200px"
            >
              Start Shopping
            </Button>
          </Center>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} bg="gray.50">
        {/* Header */}
        <HStack
          bg="white"
          px={4}
          py={3}
          alignItems="center"
          justifyContent="space-between"
          shadow={1}
        >
          <Text fontSize="xl" fontWeight="bold">
            Shopping Cart ({totalItems})
          </Text>
          
          <IconButton
            icon={<Ionicons name="trash-outline" size={20} />}
            onPress={handleClearCart}
            variant="ghost"
            colorScheme="danger"
          />
        </HStack>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert status="error" mx={4} mt={2}>
            <VStack space={1} flexShrink={1} w="100%">
              <Alert.Icon />
              <Text fontSize="md" fontWeight="medium">
                Cart Validation Issues:
              </Text>
              {validationErrors.map((error, index) => (
                <Text key={index} fontSize="sm">
                  • {error}
                </Text>
              ))}
            </VStack>
          </Alert>
        )}

        {/* Sync Status */}
        {isSyncing && (
          <HStack bg="blue.100" px={4} py={2} alignItems="center" space={2}>
            <Spinner size="sm" />
            <Text fontSize="sm" color="blue.800">
              Syncing cart with server...
            </Text>
          </HStack>
        )}

        <ScrollView flex={1} px={4} py={4}>
          <VStack space={4}>
            {/* Cart Items */}
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}

            {/* Order Summary */}
            {orderSummary && (
              <OrderSummary summary={orderSummary} />
            )}
          </VStack>
        </ScrollView>

        {/* Bottom Actions */}
        <Box bg="white" px={4} py={4} shadow={2}>
          <VStack space={3}>
            {orderSummary && (
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="lg" fontWeight="bold">
                  Total: {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(orderSummary.total)}
                </Text>
              </HStack>
            )}
            
            <Button
              size="lg"
              onPress={handleProceedToCheckout}
              isLoading={isLoading}
              isDisabled={validationErrors.length > 0}
            >
              Proceed to Checkout
            </Button>
          </VStack>
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default CartScreen;