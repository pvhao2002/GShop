import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderItems: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'COMPLETED' | 'CANCELED';
  paymentMethod: 'COD' | 'MOMO' | 'VNPAY';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  shippingAddress: string;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  orders: Order[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface OrderFilters {
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount';
  sortOrder?: 'asc' | 'desc';
}

class OrderService {
  async getOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`${API_ENDPOINTS.ORDERS}?${params.toString()}`);
    return response.data;
  }

  async getOrderById(orderId: string): Promise<Order> {
    const response = await api.get(API_ENDPOINTS.ORDER_DETAIL(orderId));
    return response.data;
  }

  async cancelOrder(orderId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`${API_ENDPOINTS.ORDER_DETAIL(orderId)}/cancel`, {
      reason,
    });
    return response.data;
  }

  async trackOrder(orderId: string): Promise<{
    trackingNumber?: string;
    status: string;
    estimatedDelivery?: string;
    trackingHistory: Array<{
      status: string;
      timestamp: string;
      location?: string;
      description: string;
    }>;
  }> {
    const response = await api.get(`${API_ENDPOINTS.ORDER_DETAIL(orderId)}/tracking`);
    return response.data;
  }

  async requestSupport(orderId: string, message: string, contactMethod: 'email' | 'phone'): Promise<{
    success: boolean;
    ticketId: string;
    message: string;
  }> {
    const response = await api.post(`${API_ENDPOINTS.ORDER_DETAIL(orderId)}/support`, {
      message,
      contactMethod,
    });
    return response.data;
  }

  async registerPushToken(token: string): Promise<{ success: boolean }> {
    const response = await api.post('/user/push-token', { token });
    return response.data;
  }
}

export default new OrderService();