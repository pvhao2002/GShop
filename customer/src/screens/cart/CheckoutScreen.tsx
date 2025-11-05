import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ScrollView,
  Alert,
  Input,
  FormControl,
  useToast,
  Modal,
  Spinner,
  Center,
} from 'native-base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';

import { RootState } from '../../store';
import {
  setShippingAddress,
  setBillingAddress,
  setPaymentMethod,
  setNotes,
  setUseSameAddress,
  createOrderFromCart,
  clearCart,
} from '../../store/slices/cartSlice';
import { 
  AddressForm, 
  PaymentMethodSelector, 
  OrderSummary 
} from '../../components/cart';
import { cartService } from '../../services/cartService';
import { paymentService } from '../../services/paymentService';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();
  
  const { 
    items, 
    orderSummary, 
    checkoutData, 
    isLoading,
    validationErrors 
  } = useSelector((state: RootState) => state.cart);

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    type: '',
    url: '',
    orderId: '',
  });

  const steps = [
    { id: 1, title: 'Shipping Address', icon: 'location-outline' },
    { id: 2, title: 'Payment Method', icon: 'card-outline' },
    { id: 3, title: 'Review Order', icon: 'checkmark-circle-outline' },
  ];

  useEffect(() => {
    if (items.length === 0) {
      navigation.navigate('Cart' as never);
    }
  }, [items]);

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!checkoutData.shippingAddress;
      case 2:
        return !!checkoutData.paymentMethod;
      case 3:
        return isStepComplete(1) && isStepComplete(2);
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Create order
      const result = await dispatch(createOrderFromCart() as any).unwrap();
      
      // Process payment based on method
      if (checkoutData.paymentMethod === 'cod') {
        // COD - Order is created, show success
        toast.show({
          description: 'Order placed successfully! You will pay on delivery.',
        });
        dispatch(clearCart());
        navigation.navigate('OrderHistory' as never);
      } else {
        // Online payment - process payment
        let paymentResult;
        
        if (checkoutData.paymentMethod === 'momo') {
          paymentResult = await paymentService.processMoMoPayment({
            orderId: result.orderId,
            amount: orderSummary?.total || 0,
          });
        } else if (checkoutData.paymentMethod === 'vnpay') {
          paymentResult = await paymentService.processVNPayPayment({
            orderId: result.orderId,
            amount: orderSummary?.total || 0,
          });
        }
        
        if (paymentResult?.success && paymentResult.paymentUrl) {
          // Open payment URL directly
          const opened = await paymentService.openPaymentUrl(
            paymentResult.paymentUrl, 
            checkoutData.paymentMethod!
          );
          
          if (!opened) {
            throw new Error('Failed to open payment gateway');
          }
          
          // Show payment modal for user guidance
          setPaymentModal({
            isOpen: true,
            type: checkoutData.paymentMethod!,
            url: paymentResult.paymentUrl,
            orderId: result.orderId,
          });
        } else {
          throw new Error(paymentResult?.message || 'Payment processing failed');
        }
      }
    } catch (error: any) {
      console.error('Order creation failed:', error);
      toast.show({
        description: error.message || 'Failed to place order. Please try again.',
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentModal({ isOpen: false, type: '', url: '', orderId: '' });
    dispatch(clearCart());
    toast.show({
      description: 'Payment successful! Your order has been placed.',
    });
    navigation.navigate('OrderHistory' as never);
  };

  const handlePaymentCancel = () => {
    setPaymentModal({ isOpen: false, type: '', url: '', orderId: '' });
    toast.show({
      description: 'Payment cancelled. Your order is still pending.',
    });
  };

  const openPaymentUrl = () => {
    if (paymentModal.url) {
      Linking.openURL(paymentModal.url);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <VStack space={4}>
            <AddressForm
              title="Shipping Address"
              address={checkoutData.shippingAddress}
              onAddressChange={(address) => dispatch(setShippingAddress(address))}
            />
            
            <AddressForm
              title="Billing Address"
              address={checkoutData.billingAddress}
              onAddressChange={(address) => dispatch(setBillingAddress(address))}
              showSameAsShipping={true}
              useSameAsShipping={checkoutData.useSameAddress}
              onUseSameAsShippingChange={(value) => dispatch(setUseSameAddress(value))}
            />
          </VStack>
        );
      
      case 2:
        return (
          <VStack space={4}>
            <PaymentMethodSelector
              selectedMethod={checkoutData.paymentMethod}
              onMethodChange={(method) => dispatch(setPaymentMethod(method))}
              orderAmount={orderSummary?.total || 0}
            />
            
            <Box bg="white" rounded="lg" shadow={1} p={4}>
              <FormControl>
                <FormControl.Label>Order Notes (Optional)</FormControl.Label>
                <Input
                  placeholder="Add any special instructions for your order..."
                  value={checkoutData.notes}
                  onChangeText={(text) => dispatch(setNotes(text))}
                  multiline
                  numberOfLines={3}
                />
              </FormControl>
            </Box>
          </VStack>
        );
      
      case 3:
        return (
          <VStack space={4}>
            {/* Order Items Summary */}
            <Box bg="white" rounded="lg" shadow={1} p={4}>
              <Text fontSize="lg" fontWeight="bold" mb={3}>
                Order Items ({items.length})
              </Text>
              {items.map((item) => (
                <HStack key={item.id} justifyContent="space-between" alignItems="center" py={2}>
                  <VStack flex={1}>
                    <Text fontSize="md" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Qty: {item.quantity}
                      {item.selectedSize && ` • Size: ${item.selectedSize}`}
                      {item.selectedColor && ` • Color: ${item.selectedColor}`}
                    </Text>
                  </VStack>
                  <Text fontSize="md" fontWeight="medium">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(item.price * item.quantity)}
                  </Text>
                </HStack>
              ))}
            </Box>

            {/* Shipping Address Summary */}
            {checkoutData.shippingAddress && (
              <Box bg="white" rounded="lg" shadow={1} p={4}>
                <Text fontSize="lg" fontWeight="bold" mb={2}>
                  Shipping Address
                </Text>
                <Text fontSize="md">{checkoutData.shippingAddress.fullName}</Text>
                <Text fontSize="sm" color="gray.600">{checkoutData.shippingAddress.phone}</Text>
                <Text fontSize="sm" color="gray.600">
                  {checkoutData.shippingAddress.address}, {checkoutData.shippingAddress.ward}, {checkoutData.shippingAddress.district}, {checkoutData.shippingAddress.city}
                </Text>
              </Box>
            )}

            {/* Payment Method Summary */}
            {checkoutData.paymentMethod && (
              <Box bg="white" rounded="lg" shadow={1} p={4}>
                <Text fontSize="lg" fontWeight="bold" mb={2}>
                  Payment Method
                </Text>
                <Text fontSize="md" textTransform="capitalize">
                  {checkoutData.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                   checkoutData.paymentMethod === 'momo' ? 'MoMo E-Wallet' : 'VNPay'}
                </Text>
              </Box>
            )}

            {/* Order Summary */}
            {orderSummary && (
              <OrderSummary summary={orderSummary} />
            )}

            {/* Notes */}
            {checkoutData.notes && (
              <Box bg="white" rounded="lg" shadow={1} p={4}>
                <Text fontSize="lg" fontWeight="bold" mb={2}>
                  Order Notes
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {checkoutData.notes}
                </Text>
              </Box>
            )}
          </VStack>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} bg="gray.50">
        {/* Header */}
        <HStack
          bg="white"
          px={4}
          py={3}
          alignItems="center"
          space={3}
          shadow={1}
        >
          <Button
            variant="ghost"
            onPress={() => navigation.goBack()}
            leftIcon={<Ionicons name="arrow-back" size={20} />}
            p={0}
          />
          <Text fontSize="xl" fontWeight="bold">
            Checkout
          </Text>
        </HStack>

        {/* Step Indicator */}
        <HStack bg="white" px={4} py={3} justifyContent="space-between">
          {steps.map((step, index) => (
            <HStack key={step.id} alignItems="center" flex={1}>
              <Box
                w={8}
                h={8}
                rounded="full"
                bg={currentStep >= step.id ? 'primary.600' : 'gray.300'}
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons
                  name={isStepComplete(step.id) ? 'checkmark' : step.icon as any}
                  size={16}
                  color="white"
                />
              </Box>
              <Text
                fontSize="xs"
                ml={2}
                color={currentStep >= step.id ? 'primary.600' : 'gray.500'}
                flex={1}
              >
                {step.title}
              </Text>
              {index < steps.length - 1 && (
                <Box flex={1} h={0.5} bg="gray.300" mx={2} />
              )}
            </HStack>
          ))}
        </HStack>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert status="error" mx={4} mt={2}>
            <VStack space={1} flexShrink={1} w="100%">
              <Alert.Icon />
              <Text fontSize="md" fontWeight="medium">
                Please fix the following issues:
              </Text>
              {validationErrors.map((error, index) => (
                <Text key={index} fontSize="sm">
                  • {error}
                </Text>
              ))}
            </VStack>
          </Alert>
        )}

        {/* Step Content */}
        <ScrollView flex={1} px={4} py={4}>
          {renderStepContent()}
        </ScrollView>

        {/* Bottom Actions */}
        <Box bg="white" px={4} py={4} shadow={2}>
          <HStack space={3}>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onPress={handlePreviousStep}
                flex={1}
              >
                Previous
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button
                onPress={handleNextStep}
                flex={1}
                isDisabled={!isStepComplete(currentStep)}
              >
                Next
              </Button>
            ) : (
              <Button
                onPress={handlePlaceOrder}
                flex={1}
                isLoading={isProcessingPayment}
                isDisabled={!isStepComplete(3) || validationErrors.length > 0}
              >
                Place Order
              </Button>
            )}
          </HStack>
        </Box>

        {/* Payment Modal */}
        <Modal isOpen={paymentModal.isOpen} onClose={handlePaymentCancel}>
          <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
            <Modal.Header>Complete Payment</Modal.Header>
            <Modal.Body>
              <VStack space={4} alignItems="center">
                <Text fontSize="lg" textAlign="center">
                  {paymentModal.type === 'momo' 
                    ? 'Complete your payment in the MoMo app'
                    : 'Complete your payment on VNPay'
                  }
                </Text>
                
                <Button onPress={openPaymentUrl} size="lg">
                  Open {paymentModal.type === 'momo' ? 'MoMo' : 'VNPay'}
                </Button>
                
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  After completing payment, return to this app to continue.
                </Text>
              </VStack>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button variant="ghost" onPress={handlePaymentCancel}>
                  Cancel
                </Button>
                <Button onPress={handlePaymentSuccess}>
                  Payment Complete
                </Button>
              </Button.Group>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </Box>
    </SafeAreaView>
  );
};

export default CheckoutScreen;