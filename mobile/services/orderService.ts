import { Order, OrderItem, PaymentMethod, Address, OrderStatus } from '../types';
import apiService from './apiService';

interface CreateOrderRequest {
    items: OrderItem[];
    shippingAddress: Address;
    paymentMethod: PaymentMethod;
}

interface OrderResponse {
    order: Order;
    paymentUrl?: string; // For VNPay/MoMo redirects
}

interface OrderListResponse {
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
}

interface OrderSearchParams {
    status?: OrderStatus;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'total' | 'status';
    sortOrder?: 'asc' | 'desc';
}

class OrderService {
    /**
     * Create a new order
     */
    async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
        return apiService.post<OrderResponse>('/orders', orderData);
    }

    /**
     * Get user's orders with pagination
     */
    async getOrders(params?: OrderSearchParams): Promise<OrderListResponse> {
        return apiService.get<OrderListResponse>('/orders', params);
    }

    /**
     * Get a specific order by ID
     */
    async getOrderById(orderId: string): Promise<Order> {
        return apiService.get<Order>(`/orders/${orderId}`);
    }

    /**
     * Cancel an order (if allowed)
     */
    async cancelOrder(orderId: string): Promise<Order> {
        return apiService.put<Order>(`/orders/${orderId}/cancel`);
    }

    /**
     * Track order status
     */
    async trackOrder(orderId: string): Promise<{
        order: Order;
        trackingInfo: {
            status: OrderStatus;
            statusHistory: Array<{
                status: OrderStatus;
                timestamp: Date;
                note?: string;
            }>;
            estimatedDelivery?: Date;
            trackingNumber?: string;
        };
    }> {
        return apiService.get(`/orders/${orderId}/track`);
    }

    /**
     * Confirm payment for an order
     */
    async confirmPayment(orderId: string, paymentData: {
        paymentMethod: PaymentMethod;
        transactionId?: string;
        paymentStatus: 'success' | 'failed';
    }): Promise<Order> {
        return apiService.post<Order>(`/orders/${orderId}/confirm-payment`, paymentData);
    }

    /**
     * Get order receipt/invoice
     */
    async getOrderReceipt(orderId: string): Promise<{
        receiptUrl: string;
        receiptData: {
            order: Order;
            customerInfo: {
                name: string;
                email: string;
                phone?: string;
            };
            itemsTotal: number;
            taxAmount: number;
            shippingAmount: number;
            totalAmount: number;
        };
    }> {
        return apiService.get(`/orders/${orderId}/receipt`);
    }
}

export default new OrderService();