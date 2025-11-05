import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  image?: string;
  stockQuantity?: number;
}

export interface CartSyncData {
  items: CartItem[];
}

export interface CheckoutData {
  items: CartItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
  };
  billingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
  };
  paymentMethod: 'cod' | 'momo' | 'vnpay';
  notes?: string;
}

export interface OrderSummary {
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
}

class CartService {
  // Sync cart with backend
  async syncCart(cartData: CartSyncData): Promise<void> {
    try {
      await api.post('/cart/sync', cartData);
    } catch (error) {
      console.error('Failed to sync cart:', error);
      throw error;
    }
  }

  // Get cart from backend
  async getCart(): Promise<CartItem[]> {
    try {
      const response = await api.get('/cart');
      return response.data.items || [];
    } catch (error) {
      console.error('Failed to get cart:', error);
      return [];
    }
  }

  // Calculate order summary
  calculateOrderSummary(items: CartItem[]): OrderSummary {
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingFee = subtotal > 500000 ? 0 : 30000; // Free shipping over 500k VND
    const tax = subtotal * 0.1; // 10% VAT
    const total = subtotal + shippingFee + tax;

    return {
      subtotal,
      shippingFee,
      tax,
      total,
    };
  }

  // Validate cart items stock
  async validateCartStock(items: CartItem[]): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const response = await api.post('/cart/validate', { items });
      return response.data;
    } catch (error) {
      console.error('Failed to validate cart stock:', error);
      return { valid: false, errors: ['Failed to validate cart items'] };
    }
  }

  // Create order from checkout data
  async createOrder(checkoutData: CheckoutData): Promise<{ orderId: string; paymentUrl?: string }> {
    try {
      const response = await api.post(API_ENDPOINTS.ORDERS, {
        items: checkoutData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          unitPrice: item.price,
        })),
        shippingAddress: checkoutData.shippingAddress,
        billingAddress: checkoutData.billingAddress || checkoutData.shippingAddress,
        paymentMethod: checkoutData.paymentMethod,
        notes: checkoutData.notes,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  // Process payment based on method
  async processPayment(orderId: string, paymentMethod: string): Promise<{ success: boolean; paymentUrl?: string; message?: string }> {
    try {
      let endpoint = '';
      switch (paymentMethod) {
        case 'cod':
          endpoint = API_ENDPOINTS.PAYMENT_COD;
          break;
        case 'momo':
          endpoint = API_ENDPOINTS.PAYMENT_MOMO;
          break;
        case 'vnpay':
          endpoint = API_ENDPOINTS.PAYMENT_VNPAY;
          break;
        default:
          throw new Error('Invalid payment method');
      }

      const response = await api.post(endpoint, { orderId });
      return response.data;
    } catch (error) {
      console.error('Failed to process payment:', error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(orderId: string): Promise<{ status: string; message?: string }> {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENT_STATUS(orderId));
      return response.data;
    } catch (error) {
      console.error('Failed to get payment status:', error);
      throw error;
    }
  }
}

export const cartService = new CartService();