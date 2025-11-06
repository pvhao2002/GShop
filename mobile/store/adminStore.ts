import { create } from 'zustand';
import { DashboardData, Order, User, Product, Category } from '../types';

interface AdminProductFilters {
    search: string;
    categoryId: string | null;
    isActive: boolean | null;
    sortBy: 'name' | 'price' | 'createdAt';
    sortOrder: 'asc' | 'desc';
}

interface AdminState {
    dashboardMetrics: DashboardData | null;
    allOrders: Order[];
    allUsers: User[];
    allProducts: Product[];
    allCategories: Category[];
    selectedProducts: string[];
    productFilters: AdminProductFilters;
    selectionMode: boolean;
    isLoading: boolean;
    error: string | null;
    
    // Actions
    setDashboardMetrics: (metrics: DashboardData) => void;
    setAllOrders: (orders: Order[]) => void;
    setAllUsers: (users: User[]) => void;
    setAllProducts: (products: Product[]) => void;
    setAllCategories: (categories: Category[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
    updateUserStatus: (userId: string, isActive: boolean) => void;
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    removeProduct: (productId: string) => void;
    
    // Category management actions
    addCategory: (category: Category) => void;
    updateCategory: (category: Category) => void;
    removeCategory: (categoryId: string) => void;
    
    // Product selection actions
    setSelectedProducts: (productIds: string[]) => void;
    toggleProductSelection: (productId: string) => void;
    clearProductSelection: () => void;
    setSelectionMode: (enabled: boolean) => void;
    
    // Product filter actions
    setProductFilters: (filters: AdminProductFilters) => void;
    clearProductFilters: () => void;
    
    clearAdminData: () => void;
    
    // Computed getters
    getOrderById: (orderId: string) => Order | undefined;
    getUserById: (userId: string) => User | undefined;
    getProductById: (productId: string) => Product | undefined;
    getOrdersByStatus: (status: Order['status']) => Order[];
    getActiveUsers: () => User[];
    getRecentOrders: (limit?: number) => Order[];
    getFilteredProducts: () => Product[];
}

const defaultProductFilters: AdminProductFilters = {
    search: '',
    categoryId: null,
    isActive: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
};

export const useAdminStore = create<AdminState>((set, get) => ({
    dashboardMetrics: null,
    allOrders: [],
    allUsers: [],
    allProducts: [],
    allCategories: [],
    selectedProducts: [],
    productFilters: defaultProductFilters,
    selectionMode: false,
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

    setAllCategories: (allCategories) => {
        set({ allCategories });
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
            allProducts: state.allProducts.filter(product => product.id !== productId),
            selectedProducts: state.selectedProducts.filter(id => id !== productId)
        }));
    },

    // Category management actions
    addCategory: (category) => {
        set((state) => ({
            allCategories: [...state.allCategories, category]
        }));
    },

    updateCategory: (updatedCategory) => {
        set((state) => ({
            allCategories: state.allCategories.map(category =>
                category.id === updatedCategory.id ? updatedCategory : category
            )
        }));
    },

    removeCategory: (categoryId) => {
        set((state) => ({
            allCategories: state.allCategories.filter(category => category.id !== categoryId)
        }));
    },

    // Product selection actions
    setSelectedProducts: (selectedProducts) => {
        set({ selectedProducts });
    },

    toggleProductSelection: (productId) => {
        set((state) => ({
            selectedProducts: state.selectedProducts.includes(productId)
                ? state.selectedProducts.filter(id => id !== productId)
                : [...state.selectedProducts, productId]
        }));
    },

    clearProductSelection: () => {
        set({ selectedProducts: [] });
    },

    setSelectionMode: (selectionMode) => {
        set({ selectionMode });
        if (!selectionMode) {
            set({ selectedProducts: [] });
        }
    },

    // Product filter actions
    setProductFilters: (productFilters) => {
        set({ productFilters });
    },

    clearProductFilters: () => {
        set({ productFilters: defaultProductFilters });
    },

    clearAdminData: () => {
        set({
            dashboardMetrics: null,
            allOrders: [],
            allUsers: [],
            allProducts: [],
            allCategories: [],
            selectedProducts: [],
            productFilters: defaultProductFilters,
            selectionMode: false,
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

    getFilteredProducts: () => {
        const { allProducts, productFilters } = get();
        let filtered = [...allProducts];

        // Filter by search query
        if (productFilters.search.trim()) {
            const query = productFilters.search.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.category.name.toLowerCase().includes(query)
            );
        }

        // Filter by category
        if (productFilters.categoryId) {
            filtered = filtered.filter(product => product.category.id === productFilters.categoryId);
        }

        // Filter by active status
        if (productFilters.isActive !== null) {
            filtered = filtered.filter(product => product.isActive === productFilters.isActive);
        }

        // Sort products
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (productFilters.sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'price':
                    aValue = a.price;
                    bValue = b.price;
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
                default:
                    return 0;
            }

            if (productFilters.sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return filtered;
    },
}));