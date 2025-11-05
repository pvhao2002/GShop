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

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface Order {
  id: string;
  userId: string;
  customer: Customer;
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
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderStatusUpdate {
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'COMPLETED' | 'CANCELED';
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
    orders: number;
  }[];
  topCustomers: {
    customerId: string;
    customerName: string;
    totalOrders: number;
    totalSpent: number;
  }[];
}