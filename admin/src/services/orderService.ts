import apiService from './apiService';
import { Order, OrdersResponse, OrderFilters, OrderStatusUpdate, OrderAnalytics } from '../types/order';

class OrderService {
  async getOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiService.get(`/orders?${params.toString()}`);
    return response.data;
  }

  async getOrderById(orderId: string): Promise<Order> {
    const response = await apiService.get(`/orders/${orderId}`);
    return response.data;
  }

  async updateOrderStatus(orderId: string, statusUpdate: OrderStatusUpdate): Promise<Order> {
    const response = await apiService.put(`/orders/${orderId}/status`, statusUpdate);
    return response.data;
  }

  async getOrderAnalytics(startDate?: string, endDate?: string): Promise<OrderAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiService.get(`/orders/analytics?${params.toString()}`);
    return response.data;
  }

  async sendOrderNotification(orderId: string, message: string): Promise<{ success: boolean }> {
    const response = await apiService.post(`/orders/${orderId}/notify`, { message });
    return response.data;
  }

  async exportOrders(filters: OrderFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiService.get(`/orders/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export default new OrderService();