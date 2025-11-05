import React from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Center,
  Icon,
  Alert,
} from 'native-base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface PaymentFailureRouteParams {
  orderId?: string;
  paymentMethod?: string;
  errorMessage?: string;
  amount?: number;
}

const PaymentFailureScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const params = route.params as PaymentFailureRouteParams;

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

  const handleRetryPayment = () => {
    // Navigate back to checkout to retry payment
    navigation.navigate('Checkout' as never);
  };

  const handleChangePaymentMethod = () => {
    // Navigate to checkout and go to payment method step
    navigation.navigate('Checkout' as never, { step: 2 } as never);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} bg="white">
        <Center flex={1} px={6}>
          <VStack space={6} alignItems="center">
            {/* Failure Icon */}
            <Box
              w={20}
              h={20}
              rounded="full"
              bg="red.100"
              alignItems="center"
              justifyContent="center"
            >
              <Icon
                as={Ionicons}
                name="close-circle"
                size="xl"
                color="red.600"
              />
            </Box>

            {/* Failure Message */}
            <VStack space={2} alignItems="center">
              <Text fontSize="2xl" fontWeight="bold" color="red.600">
                Payment Failed
              </Text>
              <Text fontSize="md" color="gray.600" textAlign="center">
                We couldn't process your payment
              </Text>
            </VStack>

            {/* Error Details */}
            {params?.errorMessage && (
              <Alert status="error" w="100%">
                <VStack space={1} flexShrink={1} w="100%">
                  <Alert.Icon />
                  <Text fontSize="md" fontWeight="medium">
                    Error Details:
                  </Text>
                  <Text fontSize="sm">
                    {params.errorMessage}
                  </Text>
                </VStack>
              </Alert>
            )}

            {/* Order Details */}
            {params?.orderId && (
              <Box
                bg="gray.50"
                rounded="lg"
                p={4}
                w="100%"
              >
                <VStack space={3}>
                  <Text fontSize="lg" fontWeight="bold" textAlign="center">
                    Order Information
                  </Text>
                  
                  <VStack space={2}>
                    <Text fontSize="md">
                      <Text fontWeight="medium">Order ID: </Text>
                      <Text color="primary.600">#{params.orderId}</Text>
                    </Text>
                    
                    {params.paymentMethod && (
                      <Text fontSize="md">
                        <Text fontWeight="medium">Payment Method: </Text>
                        {getPaymentMethodName(params.paymentMethod)}
                      </Text>
                    )}
                    
                    {params.amount && (
                      <Text fontSize="md">
                        <Text fontWeight="medium">Amount: </Text>
                        <Text fontWeight="bold">
                          {formatPrice(params.amount)}
                        </Text>
                      </Text>
                    )}
                  </VStack>
                </VStack>
              </Box>
            )}

            {/* Common Issues */}
            <Box
              bg="orange.50"
              rounded="lg"
              p={4}
              w="100%"
            >
              <VStack space={2}>
                <Text fontSize="md" fontWeight="bold" color="orange.800">
                  Common Issues:
                </Text>
                <Text fontSize="sm" color="orange.700">
                  • Insufficient balance in your account
                </Text>
                <Text fontSize="sm" color="orange.700">
                  • Network connection issues
                </Text>
                <Text fontSize="sm" color="orange.700">
                  • Payment gateway temporarily unavailable
                </Text>
                <Text fontSize="sm" color="orange.700">
                  • Card or account restrictions
                </Text>
              </VStack>
            </Box>

            {/* Action Buttons */}
            <VStack space={3} w="100%">
              <Button
                size="lg"
                onPress={handleRetryPayment}
                colorScheme="primary"
              >
                Retry Payment
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onPress={handleChangePaymentMethod}
              >
                Try Different Payment Method
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onPress={() => navigation.navigate('Cart' as never)}
              >
                Back to Cart
              </Button>
            </VStack>

            {/* Support Information */}
            <Box
              bg="blue.50"
              rounded="lg"
              p={4}
              w="100%"
            >
              <VStack space={2} alignItems="center">
                <Text fontSize="md" fontWeight="bold" color="blue.800">
                  Need Help?
                </Text>
                <Text fontSize="sm" color="blue.700" textAlign="center">
                  If you continue to experience issues, please contact our support team.
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  colorScheme="blue"
                  onPress={() => {
                    // Navigate to support or contact screen
                    // For now, just show a placeholder
                  }}
                >
                  Contact Support
                </Button>
              </VStack>
            </Box>
          </VStack>
        </Center>
      </Box>
    </SafeAreaView>
  );
};

export default PaymentFailureScreen;