import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Divider,
} from 'native-base';
import { OrderSummary as OrderSummaryType } from '../../services/cartService';

interface OrderSummaryProps {
  summary: OrderSummaryType;
  showTitle?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ summary, showTitle = true }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Box bg="white" rounded="lg" shadow={1} p={4}>
      {showTitle && (
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Order Summary
        </Text>
      )}

      <VStack space={3}>
        {/* Subtotal */}
        <HStack justifyContent="space-between">
          <Text fontSize="md" color="gray.600">
            Subtotal
          </Text>
          <Text fontSize="md">
            {formatPrice(summary.subtotal)}
          </Text>
        </HStack>

        {/* Shipping Fee */}
        <HStack justifyContent="space-between">
          <Text fontSize="md" color="gray.600">
            Shipping Fee
          </Text>
          <Text fontSize="md" color={summary.shippingFee === 0 ? 'green.600' : 'gray.900'}>
            {summary.shippingFee === 0 ? 'Free' : formatPrice(summary.shippingFee)}
          </Text>
        </HStack>

        {/* Tax */}
        <HStack justifyContent="space-between">
          <Text fontSize="md" color="gray.600">
            Tax (VAT 10%)
          </Text>
          <Text fontSize="md">
            {formatPrice(summary.tax)}
          </Text>
        </HStack>

        {/* Free shipping notice */}
        {summary.shippingFee === 0 && summary.subtotal > 500000 && (
          <Text fontSize="sm" color="green.600" textAlign="center">
            🎉 You got free shipping!
          </Text>
        )}

        {/* Free shipping progress */}
        {summary.shippingFee > 0 && summary.subtotal < 500000 && (
          <Text fontSize="sm" color="orange.600" textAlign="center">
            Add {formatPrice(500000 - summary.subtotal)} more for free shipping
          </Text>
        )}

        <Divider />

        {/* Total */}
        <HStack justifyContent="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Total
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="primary.600">
            {formatPrice(summary.total)}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
};

export default OrderSummary;