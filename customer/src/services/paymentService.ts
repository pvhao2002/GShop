import { Linking } from 'react-native';
import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export interface PaymentRequest {
  orderId: string;
  amount: number;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  message?: string;
  qrCode?: string;
}

export interface PaymentStatus {
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  transactionId?: string;
  message?: string;
  paidAmount?: number;
  paidAt?: string;
}

class PaymentService {
  // Process COD payment
  async processCODPayment(orderId: string): Promise<PaymentResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.PAYMENT_COD, {
        orderId,
      });

      return {
        success: true,
        message: 'COD order created successfully',
        ...response.data,
      };
    } catch (error: any) {
      console.error('COD payment failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'COD payment processing failed',
      };
    }
  }

  // Process MoMo payment
  async processMoMoPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.PAYMENT_MOMO, {
        orderId: paymentRequest.orderId,
        amount: paymentRequest.amount,
        returnUrl: paymentRequest.returnUrl || 'gshop://payment/success',
        cancelUrl: paymentRequest.cancelUrl || 'gshop://payment/cancel',
      });

      return {
        success: true,
        ...response.data,
      };
    } catch (error: any) {
      console.error('MoMo payment failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'MoMo payment processing failed',
      };
    }
  }

  // Process VNPay payment
  async processVNPayPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.PAYMENT_VNPAY, {
        orderId: paymentRequest.orderId,
        amount: paymentRequest.amount,
        returnUrl: paymentRequest.returnUrl || 'gshop://payment/success',
        cancelUrl: paymentRequest.cancelUrl || 'gshop://payment/cancel',
      });

      return {
        success: true,
        ...response.data,
      };
    } catch (error: any) {
      console.error('VNPay payment failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'VNPay payment processing failed',
      };
    }
  }

  // Get payment status
  async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENT_STATUS(orderId));
      return response.data;
    } catch (error: any) {
      console.error('Failed to get payment status:', error);
      return {
        status: 'failed',
        message: error.response?.data?.message || 'Failed to get payment status',
      };
    }
  }

  // Handle deep link for MoMo payment
  async handleMoMoDeepLink(url: string): Promise<{ success: boolean; orderId?: string }> {
    try {
      // Parse MoMo deep link response
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const resultCode = urlParams.get('resultCode');
      const orderId = urlParams.get('orderId');
      const transId = urlParams.get('transId');

      if (resultCode === '0' && orderId) {
        // Payment successful
        return { success: true, orderId };
      } else {
        // Payment failed or cancelled
        return { success: false, orderId: orderId || undefined };
      }
    } catch (error) {
      console.error('Failed to handle MoMo deep link:', error);
      return { success: false };
    }
  }

  // Handle deep link for VNPay payment
  async handleVNPayDeepLink(url: string): Promise<{ success: boolean; orderId?: string }> {
    try {
      // Parse VNPay deep link response
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const responseCode = urlParams.get('vnp_ResponseCode');
      const orderId = urlParams.get('vnp_TxnRef');
      const transactionNo = urlParams.get('vnp_TransactionNo');

      if (responseCode === '00' && orderId) {
        // Payment successful
        return { success: true, orderId };
      } else {
        // Payment failed or cancelled
        return { success: false, orderId: orderId || undefined };
      }
    } catch (error) {
      console.error('Failed to handle VNPay deep link:', error);
      return { success: false };
    }
  }

  // Open payment URL in external app or browser
  async openPaymentUrl(url: string, paymentMethod: 'momo' | 'vnpay'): Promise<boolean> {
    try {
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        console.error(`Cannot open ${paymentMethod} URL:`, url);
        return false;
      }
    } catch (error) {
      console.error(`Failed to open ${paymentMethod} URL:`, error);
      return false;
    }
  }

  // Verify payment with backend after deep link return
  async verifyPayment(orderId: string, paymentMethod: 'momo' | 'vnpay'): Promise<PaymentStatus> {
    try {
      const response = await api.post(`/payment/verify`, {
        orderId,
        paymentMethod,
      });

      return response.data;
    } catch (error: any) {
      console.error('Payment verification failed:', error);
      return {
        status: 'failed',
        message: error.response?.data?.message || 'Payment verification failed',
      };
    }
  }

  // Cancel payment
  async cancelPayment(orderId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.post(`/payment/cancel`, { orderId });
      return {
        success: true,
        message: response.data.message || 'Payment cancelled successfully',
      };
    } catch (error: any) {
      console.error('Payment cancellation failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel payment',
      };
    }
  }

  // Get supported payment methods
  getSupportedPaymentMethods(): Array<{
    id: 'cod' | 'momo' | 'vnpay';
    name: string;
    description: string;
    enabled: boolean;
    minAmount?: number;
    maxAmount?: number;
  }> {
    return [
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        enabled: true,
        maxAmount: 5000000, // 5M VND limit for COD
      },
      {
        id: 'momo',
        name: 'MoMo E-Wallet',
        description: 'Pay securely with MoMo wallet',
        enabled: true,
        minAmount: 10000, // 10K VND minimum
        maxAmount: 50000000, // 50M VND maximum
      },
      {
        id: 'vnpay',
        name: 'VNPay',
        description: 'Pay with VNPay gateway',
        enabled: true,
        minAmount: 10000, // 10K VND minimum
        maxAmount: 100000000, // 100M VND maximum
      },
    ];
  }

  // Validate payment method for order amount
  validatePaymentMethod(
    paymentMethod: 'cod' | 'momo' | 'vnpay',
    amount: number
  ): { valid: boolean; message?: string } {
    const methods = this.getSupportedPaymentMethods();
    const method = methods.find(m => m.id === paymentMethod);

    if (!method) {
      return { valid: false, message: 'Payment method not supported' };
    }

    if (!method.enabled) {
      return { valid: false, message: 'Payment method is currently unavailable' };
    }

    if (method.minAmount && amount < method.minAmount) {
      return {
        valid: false,
        message: `Minimum amount for ${method.name} is ${new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(method.minAmount)}`,
      };
    }

    if (method.maxAmount && amount > method.maxAmount) {
      return {
        valid: false,
        message: `Maximum amount for ${method.name} is ${new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(method.maxAmount)}`,
      };
    }

    return { valid: true };
  }
}

export const paymentService = new PaymentService();