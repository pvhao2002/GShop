import { 
    Product, 
    Category, 
    Order, 
    User, 
    DashboardData, 
    OrderStatus
} from '../types';
import apiService from './apiService';

interface AdminProductCreateRequest {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    sizes: string[];
    colors: string[];
    images: string[];
    inventory: Array<{
        sizeId: string;
        colorId: string;
        quantity: number;
    }>;
}

interface AdminOrderSearchParams {
    status?: OrderStatus;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'total' | 'status';
    sortOrder?: 'asc' | 'desc';
}

interface AdminUserSearchParams {
    role?: 'customer' | 'admin';
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'firstName' | 'email';
    sortOrder?: 'asc' | 'desc';
}

class AdminService {
    // Dashboard and Analytics
    /**
     * Get dashboard metrics and data
     */
    async getDashboardData(): Promise<DashboardData> {
        return apiService.get<DashboardData>('/admin/dashboard');
    }

    /**
     * Get revenue analytics
     */
    async getRevenueAnalytics(period: 'week' | 'month' | 'year'): Promise<{
        totalRevenue: number;
        revenueByPeriod: Array<{
            period: string;
            revenue: number;
            orderCount: number;
        }>;
        topProducts: Array<{
            product: Product;
            revenue: number;
            unitsSold: number;
        }>;
    }> {
        return apiService.get(`/admin/analytics/revenue`, { period });
    }

    // Product Management
    /**
     * Get all products for admin (including inactive)
     */
    async getAllProducts(params?: {
        page?: number;
        limit?: number;
        search?: string;
        categoryId?: string;
        isActive?: boolean;
    }): Promise<{
        products: Product[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        return apiService.get('/admin/products', params);
    }

    /**
     * Create a new product
     */
    async createProduct(productData: AdminProductCreateRequest): Promise<Product> {
        return apiService.post<Product>('/admin/products', productData);
    }

    /**
     * Update an existing product
     */
    async updateProduct(productId: string, productData: Partial<AdminProductCreateRequest>): Promise<Product> {
        return apiService.put<Product>(`/admin/products/${productId}`, productData);
    }

    /**
     * Delete a product
     */
    async deleteProduct(productId: string): Promise<void> {
        return apiService.delete<void>(`/admin/products/${productId}`);
    }

    /**
     * Toggle product active status
     */
    async toggleProductStatus(productId: string): Promise<Product> {
        return apiService.put<Product>(`/admin/products/${productId}/toggle-status`);
    }

    // Category Management
    /**
     * Get all categories for admin
     */
    async getAllCategories(): Promise<Category[]> {
        return apiService.get<Category[]>('/admin/categories');
    }

    /**
     * Create a new category
     */
    async createCategory(categoryData: {
        name: string;
        description?: string;
        parentId?: string;
    }): Promise<Category> {
        return apiService.post<Category>('/admin/categories', categoryData);
    }

    /**
     * Update a category
     */
    async updateCategory(categoryId: string, categoryData: {
        name?: string;
        description?: string;
        parentId?: string;
    }): Promise<Category> {
        return apiService.put<Category>(`/admin/categories/${categoryId}`, categoryData);
    }

    /**
     * Delete a category
     */
    async deleteCategory(categoryId: string): Promise<void> {
        return apiService.delete<void>(`/admin/categories/${categoryId}`);
    }

    // Order Management
    /**
     * Get all orders for admin
     */
    async getAllOrders(params?: AdminOrderSearchParams): Promise<{
        orders: Order[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        return apiService.get('/admin/orders', params);
    }

    /**
     * Update order status
     */
    async updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<Order> {
        return apiService.put<Order>(`/admin/orders/${orderId}/status`, {
            status,
            note
        });
    }

    /**
     * Get order details for admin
     */
    async getOrderDetails(orderId: string): Promise<{
        order: Order;
        customer: User;
        statusHistory: Array<{
            status: OrderStatus;
            timestamp: Date;
            note?: string;
            updatedBy: string;
        }>;
    }> {
        return apiService.get(`/admin/orders/${orderId}`);
    }

    // User Management
    /**
     * Get all users for admin
     */
    async getAllUsers(params?: AdminUserSearchParams): Promise<{
        users: User[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        return apiService.get('/admin/users', params);
    }

    /**
     * Get user details
     */
    async getUserDetails(userId: string): Promise<{
        user: User;
        orderHistory: Order[];
        totalSpent: number;
        orderCount: number;
    }> {
        return apiService.get(`/admin/users/${userId}`);
    }

    /**
     * Update user status (lock/unlock account)
     */
    async updateUserStatus(userId: string, isActive: boolean): Promise<User> {
        return apiService.put<User>(`/admin/users/${userId}/status`, {
            isActive
        });
    }

    /**
     * Update user role
     */
    async updateUserRole(userId: string, role: 'customer' | 'admin'): Promise<User> {
        return apiService.put<User>(`/admin/users/${userId}/role`, {
            role
        });
    }

    // Inventory Management
    /**
     * Update product inventory
     */
    async updateInventory(productId: string, inventory: Array<{
        sizeId: string;
        colorId: string;
        quantity: number;
    }>): Promise<Product> {
        return apiService.put<Product>(`/admin/products/${productId}/inventory`, {
            inventory
        });
    }

    /**
     * Get low stock products
     */
    async getLowStockProducts(threshold: number = 10): Promise<Array<{
        product: Product;
        lowStockVariants: Array<{
            sizeId: string;
            colorId: string;
            quantity: number;
        }>;
    }>> {
        return apiService.get('/admin/inventory/low-stock', { threshold });
    }
}

export default new AdminService();