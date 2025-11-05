import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Radio,
  Image,
  Pressable,
} from 'native-base';
import { paymentService } from '../../services/paymentService';

interface PaymentMethod {
  id: 'cod' | 'momo' | 'vnpay';
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

interface PaymentMethodSelectorProps {
  selectedMethod: 'cod' | 'momo' | 'vnpay' | null;
  onMethodChange: (method: 'cod' | 'momo' | 'vnpay') => void;
  orderAmount?: number;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  orderAmount = 0,
}) => {
  const supportedMethods = paymentService.getSupportedPaymentMethods();
  
  const paymentMethods: PaymentMethod[] = supportedMethods.map(method => {
    const validation = paymentService.validatePaymentMethod(method.id, orderAmount);
    
    return {
      id: method.id,
      name: method.name,
      description: validation.valid ? method.description : validation.message || method.description,
      icon: method.id === 'cod' ? '💵' : method.id === 'momo' ? '🟣' : '🔵',
      enabled: validation.valid && method.enabled,
    };
  });

  return (
    <Box bg="white" rounded="lg" shadow={1} p={4}>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Payment Method
      </Text>

      <Radio.Group
        name="paymentMethod"
        value={selectedMethod || ''}
        onChange={(value) => onMethodChange(value as 'cod' | 'momo' | 'vnpay')}
      >
        <VStack space={3}>
          {paymentMethods.map((method) => (
            <Pressable
              key={method.id}
              onPress={() => method.enabled && onMethodChange(method.id)}
              opacity={method.enabled ? 1 : 0.5}
            >
              <Box
                borderWidth={1}
                borderColor={selectedMethod === method.id ? 'primary.600' : 'gray.200'}
                rounded="lg"
                p={3}
                bg={selectedMethod === method.id ? 'primary.50' : 'white'}
              >
                <HStack space={3} alignItems="center">
                  <Radio
                    value={method.id}
                    isDisabled={!method.enabled}
                    size="md"
                  />
                  
                  <Text fontSize="2xl">{method.icon}</Text>
                  
                  <VStack flex={1}>
                    <Text fontSize="md" fontWeight="medium">
                      {method.name}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {method.description}
                    </Text>
                    {!method.enabled && (
                      <Text fontSize="xs" color="red.500">
                        Currently unavailable
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </Box>
            </Pressable>
          ))}
        </VStack>
      </Radio.Group>

      {/* Payment Method Details */}
      {selectedMethod && (
        <Box mt={4} p={3} bg="gray.50" rounded="md">
          {selectedMethod === 'cod' && (
            <VStack space={2}>
              <Text fontSize="sm" fontWeight="medium">
                Cash on Delivery Information:
              </Text>
              <Text fontSize="xs" color="gray.600">
                • Pay in cash when your order is delivered
              </Text>
              <Text fontSize="xs" color="gray.600">
                • Please prepare exact amount if possible
              </Text>
              <Text fontSize="xs" color="gray.600">
                • Available for orders under 5,000,000 VND
              </Text>
            </VStack>
          )}
          
          {selectedMethod === 'momo' && (
            <VStack space={2}>
              <Text fontSize="sm" fontWeight="medium">
                MoMo Payment Information:
              </Text>
              <Text fontSize="xs" color="gray.600">
                • Secure payment through MoMo e-wallet
              </Text>
              <Text fontSize="xs" color="gray.600">
                • You will be redirected to MoMo app
              </Text>
              <Text fontSize="xs" color="gray.600">
                • Payment is processed instantly
              </Text>
            </VStack>
          )}
          
          {selectedMethod === 'vnpay' && (
            <VStack space={2}>
              <Text fontSize="sm" fontWeight="medium">
                VNPay Payment Information:
              </Text>
              <Text fontSize="xs" color="gray.600">
                • Pay with credit/debit cards or bank transfer
              </Text>
              <Text fontSize="xs" color="gray.600">
                • Secure payment gateway
              </Text>
              <Text fontSize="xs" color="gray.600">
                • Supports major Vietnamese banks
              </Text>
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PaymentMethodSelector;