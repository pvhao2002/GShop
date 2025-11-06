import { create } from 'zustand';
import { DashboardData, Order, User, Product } from '../types';

interface AdminState {
    dashboardMetrics: DashboardData | null;
    allOrders: Order[];
    allUsers: User[];
    allProducts: Product[];
    isLoading: boolean;
    error: string | null;
    
    // Actions
    setDashboardMetrics: (metrics: DashboardData) => void;
    setAllOrders: (orders: Order[]) => void;
    setAllUsers: (users: User[]) => void;
    setAllProducts: (products: Product[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
    updateUserStatus: (userId: string, isActive: boolean) => void;
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    removeProduct: (productId: string) => void;
    clearAdminData: () => void;
    
    // Computed getters
    getOrderById: (orderId: string) => Order | undefined;
    getUserById: (userId: string) => User | undefined;
    getProductById: (productId: string) => Product | undefined;
    getOrdersByStatus: (status: Order['status']) => Order[];
    getActiveUsers: () => User[];
    getRecentOrders: (limit?: number) => Order[];
}

export const useAdminStore = create<AdminState>((set, get) => ({
    dashboardMetrics: null,
    allOrders: [],
    allUsers: [],
    allProducts: [],
    isLoading: false,
    error: null,

    setDashboardMetrics: (dashboardMetrics) => {
        set({ dashboardMetrics });
    },

    setAllOrders: (allOrders) => {
        set({ allOrders });
    },

    setAllUsers: (allUsers) => {
        set({ allUsers });
    },

    setAllProducts: (allProducts) => {
        set({ allProducts });
    },

    setLoading: (isLoading) => {
        set({ isLoading });
    },

    setError: (error) => {
        set({ error });
    },

    updateOrderStatus: (orderId, status) => {
        set((state) => ({
            allOrders: state.allOrders.map(order =>
                order.id === orderId 
                    ? { ...order, status, updatedAt: new Date() }
                    : order
            )
        }));
    },

    updateUserStatus: (userId, isActive) => {
        set((state) => ({
            allUsers: state.allUsers.map(user =>
                user.id === userId 
                    ? { ...user, isActive, updatedAt: new Date() }
                    : user
            )
        }));
    },

    addProduct: (product) => {
        set((state) => ({
            allProducts: [...state.allProducts, product]
        }));
    },

    updateProduct: (updatedProduct) => {
        set((state) => ({
            allProducts: state.allProducts.map(product =>
                product.id === updatedProduct.id ? updatedProduct : product
            )
        }));
    },

    removeProduct: (productId) => {
        set((state) => ({
            allProducts: state.allProducts.filter(product => product.id !== productId)
        }));
    },

    clearAdminData: () => {
        set({
            dashboardMetrics: null,
            allOrders: [],
            allUsers: [],
            allProducts: [],
            error: null
        });
    },

    getOrderById: (orderId) => {
        const { allOrders } = get();
        return allOrders.find(order => order.id === orderId);
    },

    getUserById: (userId) => {
        const { allUsers } = get();
        return allUsers.find(user => user.id === userId);
    },

    getProductById: (productId) => {
        const { allProducts } = get();
        return allProducts.find(product => product.id === productId);
    },

    getOrdersByStatus: (status) => {
        const { allOrders } = get();
        return allOrders.filter(order => order.status === status);
    },

    getActiveUsers: () => {
        const { allUsers } = get();
        return allUsers.filter(user => user.isActive);
    },

    getRecentOrders: (limit = 10) => {
        const { allOrders } = get();
        return allOrders
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
    },
}));