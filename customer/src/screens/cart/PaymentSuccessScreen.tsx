import React, { useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Center,
  Icon,
} from 'native-base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { clearCart } from '../../store/slices/cartSlice';

interface PaymentSuccessRouteParams {
  orderId: string;
  paymentMethod: string;
  amount: number;
}

const PaymentSuccessScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  const params = route.params as PaymentSuccessRouteParams;

  useEffect(() => {
    // Clear cart after successful payment
    dispatch(clearCart());
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'momo':
        return 'MoMo E-Wallet';
      case 'vnpay':
        return 'VNPay';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} bg="white">
        <Center flex={1} px={6}>
          <VStack space={6} alignItems="center">
            {/* Success Icon */}
            <Box
              w={20}
              h={20}
              rounded="full"
              bg="green.100"
              alignItems="center"
              justifyContent="center"
            >
              <Icon
                as={Ionicons}
                name="checkmark-circle"
                size="xl"
                color="green.600"
              />
            </Box>

            {/* Success Message */}
            <VStack space={2} alignItems="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                Payment Successful!
              </Text>
              <Text fontSize="md" color="gray.600" textAlign="center">
                Your order has been placed successfully
              </Text>
            </VStack>

            {/* Order Details */}
            <Box
              bg="gray.50"
              rounded="lg"
              p={4}
              w="100%"
            >
              <VStack space={3}>
                <Text fontSize="lg" fontWeight="bold" textAlign="center">
                  Order Details
                </Text>
                
                <VStack space={2}>
                  <Text fontSize="md">
                    <Text fontWeight="medium">Order ID: </Text>
                    <Text color="primary.600">#{params?.orderId}</Text>
                  </Text>
                  
                  <Text fontSize="md">
                    <Text fontWeight="medium">Payment Method: </Text>
                    {getPaymentMethodName(params?.paymentMethod || '')}
                  </Text>
                  
                  {params?.amount && (
                    <Text fontSize="md">
                      <Text fontWeight="medium">Amount Paid: </Text>
                      <Text color="green.600" fontWeight="bold">
                        {formatPrice(params.amount)}
                      </Text>
                    </Text>
                  )}
                </VStack>
              </VStack>
            </Box>

            {/* Next Steps */}
            <Box
              bg="blue.50"
              rounded="lg"
              p={4}
              w="100%"
            >
              <VStack space={2}>
                <Text fontSize="md" fontWeight="bold" color="blue.800">
                  What's Next?
                </Text>
                <Text fontSize="sm" color="blue.700">
                  • You will receive an order confirmation email shortly
                </Text>
                <Text fontSize="sm" color="blue.700">
                  • Track your order status in the Order History section
                </Text>
                <Text fontSize="sm" color="blue.700">
                  • You'll get notifications about shipping updates
                </Text>
              </VStack>
            </Box>

            {/* Action Buttons */}
            <VStack space={3} w="100%">
              <Button
                size="lg"
                onPress={() => navigation.navigate('OrderHistory' as never)}
              >
                View Order History
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onPress={() => navigation.navigate('Home' as never)}
              >
                Continue Shopping
              </Button>
            </VStack>
          </VStack>
        </Center>
      </Box>
    </SafeAreaView>
  );
};

export default PaymentSuccessScreen;