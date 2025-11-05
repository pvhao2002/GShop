import apiService from './apiService';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number; orders: number }>;
}

export interface ProductAnalytics {
  topSellingProducts: Array<{
    id: number;
    name: string;
    totalSold: number;
    revenue: number;
    category: string;
  }>;
  categoryPerformance: Array<{
    category: string;
    totalSold: number;
    revenue: number;
    percentage: number;
  }>;
  inventoryStatus: Array<{
    id: number;
    name: string;
    currentStock: number;
    lowStockThreshold: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
  }>;
  productTrends: Array<{
    productId: number;
    productName: string;
    data: Array<{ date: string; sales: number }>;
  }>;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  customerGrowth: number;
  customerRetention: number;
  averageLifetimeValue: number;
  customerSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
    averageOrderValue: number;
  }>;
  customerActivity: Array<{
    date: string;
    newCustomers: number;
    returningCustomers: number;
  }>;
}

export interface AnalyticsDashboard {
  sales: SalesAnalytics;
  products: ProductAnalytics;
  customers: CustomerAnalytics;
}

class AnalyticsService {
  async getSalesAnalytics(dateRange: DateRange): Promise<SalesAnalytics> {
    try {
      const response = await apiService.get('/statistics/sales', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      throw error;
    }
  }

  async getProductAnalytics(dateRange: DateRange): Promise<ProductAnalytics> {
    try {
      const response = await apiService.get('/statistics/products', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      throw error;
    }
  }

  async getCustomerAnalytics(dateRange: DateRange): Promise<CustomerAnalytics> {
    try {
      const response = await apiService.get('/statistics/customers', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      throw error;
    }
  }

  async getDashboardAnalytics(dateRange: DateRange): Promise<AnalyticsDashboard> {
    try {
      const [sales, products, customers] = await Promise.all([
        this.getSalesAnalytics(dateRange),
        this.getProductAnalytics(dateRange),
        this.getCustomerAnalytics(dateRange),
      ]);

      return {
        sales,
        products,
        customers,
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  }

  // Mock data for development/testing
  getMockSalesAnalytics(): SalesAnalytics {
    return {
      totalRevenue: 125000,
      totalOrders: 1250,
      averageOrderValue: 100,
      revenueGrowth: 15.3,
      ordersGrowth: 12.8,
      dailyRevenue: [
        { date: '2024-01-01', revenue: 4200, orders: 42 },
        { date: '2024-01-02', revenue: 3800, orders: 38 },
        { date: '2024-01-03', revenue: 5100, orders: 51 },
        { date: '2024-01-04', revenue: 4600, orders: 46 },
        { date: '2024-01-05', revenue: 5300, orders: 53 },
        { date: '2024-01-06', revenue: 4900, orders: 49 },
        { date: '2024-01-07', revenue: 5500, orders: 55 },
      ],
      monthlyRevenue: [
        { month: 'Jan', revenue: 45000, orders: 450 },
        { month: 'Feb', revenue: 52000, orders: 520 },
        { month: 'Mar', revenue: 48000, orders: 480 },
        { month: 'Apr', revenue: 61000, orders: 610 },
        { month: 'May', revenue: 55000, orders: 550 },
        { month: 'Jun', revenue: 67000, orders: 670 },
      ],
    };
  }

  getMockProductAnalytics(): ProductAnalytics {
    return {
      topSellingProducts: [
        { id: 1, name: 'iPhone 15 Pro', totalSold: 150, revenue: 149850, category: 'Electronics' },
        { id: 2, name: 'Nike Air Max', totalSold: 120, revenue: 14400, category: 'Footwear' },
        { id: 3, name: 'MacBook Pro', totalSold: 80, revenue: 159920, category: 'Electronics' },
        { id: 4, name: 'Levi\'s Jeans', totalSold: 200, revenue: 15000, category: 'Clothing' },
        { id: 5, name: 'Samsung Galaxy S24', totalSold: 95, revenue: 85500, category: 'Electronics' },
      ],
      categoryPerformance: [
        { category: 'Electronics', totalSold: 325, revenue: 395270, percentage: 45.2 },
        { category: 'Clothing', totalSold: 280, revenue: 28000, percentage: 32.1 },
        { category: 'Footwear', totalSold: 150, revenue: 18000, percentage: 17.2 },
        { category: 'Books', totalSold: 45, revenue: 4500, percentage: 5.5 },
      ],
      inventoryStatus: [
        { id: 1, name: 'iPhone 15 Pro', currentStock: 25, lowStockThreshold: 10, status: 'in_stock' },
        { id: 2, name: 'Nike Air Max', currentStock: 8, lowStockThreshold: 10, status: 'low_stock' },
        { id: 3, name: 'MacBook Pro', currentStock: 0, lowStockThreshold: 5, status: 'out_of_stock' },
        { id: 4, name: 'Levi\'s Jeans', currentStock: 45, lowStockThreshold: 15, status: 'in_stock' },
      ],
      productTrends: [
        {
          productId: 1,
          productName: 'iPhone 15 Pro',
          data: [
            { date: '2024-01-01', sales: 12 },
            { date: '2024-01-02', sales: 8 },
            { date: '2024-01-03', sales: 15 },
            { date: '2024-01-04', sales: 10 },
            { date: '2024-01-05', sales: 18 },
            { date: '2024-01-06', sales: 14 },
            { date: '2024-01-07', sales: 20 },
          ],
        },
      ],
    };
  }

  getMockCustomerAnalytics(): CustomerAnalytics {
    return {
      totalCustomers: 2500,
      newCustomers: 180,
      customerGrowth: 8.5,
      customerRetention: 72.3,
      averageLifetimeValue: 450,
      customerSegments: [
        { segment: 'VIP', count: 125, percentage: 5, averageOrderValue: 250 },
        { segment: 'Regular', count: 1500, percentage: 60, averageOrderValue: 100 },
        { segment: 'New', count: 875, percentage: 35, averageOrderValue: 75 },
      ],
      customerActivity: [
        { date: '2024-01-01', newCustomers: 25, returningCustomers: 180 },
        { date: '2024-01-02', newCustomers: 18, returningCustomers: 165 },
        { date: '2024-01-03', newCustomers: 32, returningCustomers: 195 },
        { date: '2024-01-04', newCustomers: 28, returningCustomers: 172 },
        { date: '2024-01-05', newCustomers: 35, returningCustomers: 210 },
        { date: '2024-01-06', newCustomers: 22, returningCustomers: 188 },
        { date: '2024-01-07', newCustomers: 40, returningCustomers: 225 },
      ],
    };
  }
}

export const analyticsService = new AnalyticsService();