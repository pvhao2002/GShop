import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { CartItem } from '../../components/ui/CartItem';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { Address, PaymentMethod } from '../../types';

interface CheckoutFormData {
  address: Address;
  paymentMethod: PaymentMethod;
}

export default function CheckoutScreen() {
  const {
    cartItems,
    isLoading,
    error,
    getCartTotal,
    getCartItemCount,
    clearCart,
  } = useCartStore();

  const { user } = useAuthStore();

  const [formData, setFormData] = useState<CheckoutFormData>({
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'Vietnam',
    },
    paymentMethod: 'cod',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(true);

  useEffect(() => {
    if (cartItems.length === 0) {
      Alert.alert(
        'Empty Cart',
        'Your cart is empty. Please add some items before checkout.',
        [{ text: 'OK', onPress: () => router.replace('/(user)') }]
      );
    }
  }, [cartItems]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: method,
    }));
  };

  const validateForm = (): boolean => {
    const { address } = formData;
    
    if (!address.street.trim()) {
      Alert.alert('Validation Error', 'Please enter your street address.');
      return false;
    }
    
    if (!address.city.trim()) {
      Alert.alert('Validation Error', 'Please enter your city.');
      return false;
    }
    
    if (!address.state.trim()) {
      Alert.alert('Validation Error', 'Please enter your state/province.');
      return false;
    }
    
    if (!address.zipCode.trim()) {
      Alert.alert('Validation Error', 'Please enter your zip code.');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsProcessing(true);

      const cartTotal = getCartTotal();
      const tax = cartTotal * 0.1;
      const shipping = cartTotal > 500000 ? 0 : 30000;
      const finalTotal = cartTotal + tax + shipping;

      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order object (in real app, this would be sent to backend)
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalPrice: item.product.price * item.quantity,
        })),
        shippingAddress: formData.address,
        paymentMethod: formData.paymentMethod,
        subtotal: cartTotal,
        tax,
        shipping,
        total: finalTotal,
      };

      console.log('Order placed:', orderData);

      // Clear cart after successful order
      clearCart();

      // Show success message and navigate to order confirmation
      Alert.alert(
        'Order Placed Successfully!',
        `Your order has been placed successfully. Total: ${formatPrice(finalTotal)}`,
        [
          {
            text: 'Continue Shopping',
            onPress: () => router.replace('/(user)'),
          },
        ]
      );

    } catch (err) {
      console.error('Error placing order:', err);
      Alert.alert(
        'Order Failed',
        'There was an error processing your order. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return null; // Will be handled by useEffect
  }

  const cartTotal = getCartTotal();
  const itemCount = getCartItemCount();
  const tax = cartTotal * 0.1;
  const shipping = cartTotal > 500000 ? 0 : 30000;
  const finalTotal = cartTotal + tax + shipping;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerRight} />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Street Address *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.address.street}
              onChangeText={(value) => handleAddressChange('street', value)}
              placeholder="Enter your street address"
              placeholderTextColor="#999999"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, styles.inputHalf]}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.address.city}
                onChangeText={(value) => handleAddressChange('city', value)}
                placeholder="City"
                placeholderTextColor="#999999"
              />
            </View>

            <View style={[styles.inputContainer, styles.inputHalf]}>
              <Text style={styles.inputLabel}>State/Province *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.address.state}
                onChangeText={(value) => handleAddressChange('state', value)}
                placeholder="State"
                placeholderTextColor="#999999"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, styles.inputHalf]}>
              <Text style={styles.inputLabel}>Zip Code *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.address.zipCode}
                onChangeText={(value) => handleAddressChange('zipCode', value)}
                placeholder="Zip Code"
                placeholderTextColor="#999999"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputContainer, styles.inputHalf]}>
              <Text style={styles.inputLabel}>Country</Text>
              <TextInput
                style={styles.textInput}
                value={formData.address.country}
                onChangeText={(value) => handleAddressChange('country', value)}
                placeholder="Country"
                placeholderTextColor="#999999"
              />
            </View>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              formData.paymentMethod === 'cod' && styles.paymentOptionSelected,
            ]}
            onPress={() => handlePaymentMethodChange('cod')}
          >
            <View style={styles.paymentOptionLeft}>
              <Ionicons name="cash-outline" size={24} color="#333333" />
              <View style={styles.paymentOptionText}>
                <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
                <Text style={styles.paymentOptionSubtitle}>Pay when you receive your order</Text>
              </View>
            </View>
            <View style={[
              styles.radioButton,
              formData.paymentMethod === 'cod' && styles.radioButtonSelected,
            ]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              formData.paymentMethod === 'vnpay' && styles.paymentOptionSelected,
            ]}
            onPress={() => handlePaymentMethodChange('vnpay')}
          >
            <View style={styles.paymentOptionLeft}>
              <Ionicons name="card-outline" size={24} color="#333333" />
              <View style={styles.paymentOptionText}>
                <Text style={styles.paymentOptionTitle}>VNPay</Text>
                <Text style={styles.paymentOptionSubtitle}>Pay securely with VNPay</Text>
              </View>
            </View>
            <View style={[
              styles.radioButton,
              formData.paymentMethod === 'vnpay' && styles.radioButtonSelected,
            ]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              formData.paymentMethod === 'momo' && styles.paymentOptionSelected,
            ]}
            onPress={() => handlePaymentMethodChange('momo')}
          >
            <View style={styles.paymentOptionLeft}>
              <Ionicons name="phone-portrait-outline" size={24} color="#333333" />
              <View style={styles.paymentOptionText}>
                <Text style={styles.paymentOptionTitle}>MoMo</Text>
                <Text style={styles.paymentOptionSubtitle}>Pay with MoMo e-wallet</Text>
              </View>
            </View>
            <View style={[
              styles.radioButton,
              formData.paymentMethod === 'momo' && styles.radioButtonSelected,
            ]} />
          </TouchableOpacity>
        </View>

        {/* Order Summary Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowOrderSummary(!showOrderSummary)}
          >
            <Text style={styles.sectionTitle}>
              Order Summary ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </Text>
            <Ionicons
              name={showOrderSummary ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#333333"
            />
          </TouchableOpacity>

          {showOrderSummary && (
            <>
              <View style={styles.orderItemsContainer}>
                {cartItems.map((item) => (
                  <CartItem
                    key={`${item.productId}-${item.sizeId}-${item.colorId}`}
                    item={item}
                    onUpdateQuantity={() => {}} // Read-only in checkout
                    onRemove={() => {}} // Read-only in checkout
                    showRemoveButton={false}
                  />
                ))}
              </View>

              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{formatPrice(cartTotal)}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax (10%)</Text>
                  <Text style={styles.summaryValue}>{formatPrice(tax)}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shipping</Text>
                  <Text style={[
                    styles.summaryValue,
                    shipping === 0 && styles.freeShipping
                  ]}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatPrice(finalTotal)}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, isProcessing && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <LoadingSpinner size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.placeOrderButtonText}>
              Place Order • {formatPrice(finalTotal)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'Poppins',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  errorContainer: {
    backgroundColor: '#FFE6E6',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'Poppins',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    fontFamily: 'Inter',
    backgroundColor: '#FFFFFF',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: '#000000',
    backgroundColor: '#F5F5F5',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'Poppins',
  },
  paymentOptionSubtitle: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Inter',
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  radioButtonSelected: {
    borderColor: '#000000',
    backgroundColor: '#000000',
  },
  orderItemsContainer: {
    marginBottom: 16,
  },
  summaryContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    fontFamily: 'Inter',
  },
  freeShipping: {
    color: '#4A5D23',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'Poppins',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Poppins',
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  placeOrderButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#999999',
  },
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
});