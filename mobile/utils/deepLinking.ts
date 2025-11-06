import { LinkingOptions } from '@react-navigation/native';

export const linkingConfig: LinkingOptions<any> = {
    prefixes: ['ecommerce-app://', 'https://ecommerce-app.com'],
    config: {
        screens: {
            index: '',
            login: 'login',
            register: 'register',
            'forgot-password': 'forgot-password',
            'admin-login': 'admin-login',
            '(user)': {
                screens: {
                    index: 'home',
                    search: 'search',
                    'product/[id]': 'product/:id',
                    cart: 'cart',
                    checkout: 'checkout',
                    profile: 'profile',
                    'order-history': 'orders',
                    'order-detail': 'order/:orderId',
                },
            },
            '(admin)': {
                screens: {
                    index: 'admin',
                    products: 'admin/products',
                    orders: 'admin/orders',
                    'order-detail': 'admin/order/:orderId',
                    users: 'admin/users',
                    'user-detail': 'admin/user/:userId',
                    categories: 'admin/categories',
                },
            },
        },
    },
};

export const deepLinkRoutes = {
    // Customer routes
    home: '/(user)',
    search: '/(user)/search',
    product: (id: string) => `/(user)/product/${id}`,
    cart: '/(user)/cart',
    checkout: '/(user)/checkout',
    profile: '/(user)/profile',
    orders: '/(user)/order-history',
    orderDetail: (orderId: string) => `/(user)/order-detail?orderId=${orderId}`,

    // Admin routes
    adminDashboard: '/(admin)',
    adminProducts: '/(admin)/products',
    adminOrders: '/(admin)/orders',
    adminOrderDetail: (orderId: string) => `/(admin)/order-detail?orderId=${orderId}`,
    adminUsers: '/(admin)/users',
    adminUserDetail: (userId: string) => `/(admin)/user-detail?userId=${userId}`,
    adminCategories: '/(admin)/categories',

    // Auth routes
    login: '/login',
    register: '/register',
    adminLogin: '/admin-login',
    forgotPassword: '/forgot-password',
};

// Overloaded function signatures for type safety
export function generateDeepLink(route: 'product', id: string): string;
export function generateDeepLink(route: 'orderDetail', orderId: string): string;
export function generateDeepLink(route: 'adminOrderDetail', orderId: string): string;
export function generateDeepLink(route: 'adminUserDetail', userId: string): string;
export function generateDeepLink(route: Exclude<keyof typeof deepLinkRoutes, 'product' | 'orderDetail' | 'adminOrderDetail' | 'adminUserDetail'>): string;
export function generateDeepLink(route: keyof typeof deepLinkRoutes, ...params: string[]): string {
    const routeFunction = deepLinkRoutes[route];

    if (typeof routeFunction === 'function') {
        // Type assertion is safe here because we control the route functions
        return (routeFunction as any)(...params);
    }

    return routeFunction as string;
}

export function isValidDeepLink(url: string): boolean {
    try {
        const validRoutes = Object.values(deepLinkRoutes);
        const dynamicRoutes = [
            /^\/\(user\)\/product\/[^\/]+$/,
            /^\/\(user\)\/order-detail\?orderId=[^&]+$/,
            /^\/\(admin\)\/order-detail\?orderId=[^&]+$/,
            /^\/\(admin\)\/user-detail\?userId=[^&]+$/,
        ];

        // Check static routes
        if (validRoutes.includes(url)) {
            return true;
        }

        // Check dynamic routes
        return dynamicRoutes.some(pattern => pattern.test(url));
    } catch (error) {
        console.error('Deep link validation error:', error);
        return false;
    }
}