import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useToast } from 'native-base';
import { paymentService } from '../services/paymentService';

export const usePaymentDeepLink = () => {
  const navigation = useNavigation();
  const toast = useToast();

  useEffect(() => {
    // Handle initial URL if app was opened from deep link
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          handleDeepLink(initialUrl);
        }
      } catch (error) {
        console.error('Error getting initial URL:', error);
      }
    };

    // Handle URL changes while app is running
    const handleUrlChange = (url: string) => {
      handleDeepLink(url);
    };

    // Set up listeners
    handleInitialURL();
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrlChange(url));

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleDeepLink = async (url: string) => {
    try {
      console.log('Handling deep link:', url);

      // Check if it's a payment return URL
      if (url.includes('gshop://payment/')) {
        const urlParts = url.split('/');
        const action = urlParts[urlParts.length - 1];

        if (action === 'success') {
          await handlePaymentSuccess(url);
        } else if (action === 'cancel' || action === 'failure') {
          await handlePaymentFailure(url);
        }
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
      toast.show({
        description: 'Error processing payment response',
        status: 'error',
      });
    }
  };

  const handlePaymentSuccess = async (url: string) => {
    try {
      // Determine payment method from URL parameters
      const urlParams = new URLSearchParams(url.split('?')[1]);
      let paymentResult;
      let orderId;

      if (url.includes('momo') || urlParams.get('partnerCode')) {
        // MoMo payment
        paymentResult = await paymentService.handleMoMoDeepLink(url);
        orderId = paymentResult.orderId;
      } else if (url.includes('vnpay') || urlParams.get('vnp_ResponseCode')) {
        // VNPay payment
        paymentResult = await paymentService.handleVNPayDeepLink(url);
        orderId = paymentResult.orderId;
      }

      if (paymentResult?.success && orderId) {
        // Verify payment with backend
        const paymentMethod = url.includes('momo') ? 'momo' : 'vnpay';
        const verificationResult = await paymentService.verifyPayment(orderId, paymentMethod);

        if (verificationResult.status === 'success') {
          // Navigate to success screen
          navigation.navigate('PaymentSuccess' as never, {
            orderId,
            paymentMethod,
            amount: verificationResult.paidAmount,
          } as never);
        } else {
          // Payment verification failed
          navigation.navigate('PaymentFailure' as never, {
            orderId,
            paymentMethod,
            errorMessage: verificationResult.message || 'Payment verification failed',
          } as never);
        }
      } else {
        // Payment failed
        navigation.navigate('PaymentFailure' as never, {
          orderId: paymentResult?.orderId,
          errorMessage: 'Payment was not successful',
        } as never);
      }
    } catch (error) {
      console.error('Error handling payment success:', error);
      navigation.navigate('PaymentFailure' as never, {
        errorMessage: 'Error processing payment response',
      } as never);
    }
  };

  const handlePaymentFailure = async (url: string) => {
    try {
      // Extract order ID and error information from URL
      const urlParams = new URLSearchParams(url.split('?')[1]);
      let orderId;
      let errorMessage = 'Payment was cancelled or failed';

      if (url.includes('momo')) {
        orderId = urlParams.get('orderId');
        const resultCode = urlParams.get('resultCode');
        if (resultCode && resultCode !== '0') {
          errorMessage = `MoMo payment failed (Code: ${resultCode})`;
        }
      } else if (url.includes('vnpay')) {
        orderId = urlParams.get('vnp_TxnRef');
        const responseCode = urlParams.get('vnp_ResponseCode');
        if (responseCode && responseCode !== '00') {
          errorMessage = `VNPay payment failed (Code: ${responseCode})`;
        }
      }

      // Navigate to failure screen
      navigation.navigate('PaymentFailure' as never, {
        orderId,
        errorMessage,
      } as never);
    } catch (error) {
      console.error('Error handling payment failure:', error);
      navigation.navigate('PaymentFailure' as never, {
        errorMessage: 'Error processing payment response',
      } as never);
    }
  };

  return {
    handleDeepLink,
  };
};