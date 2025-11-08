/**
 * Global app configuration.
 * Define base URLs and API endpoints here for different environments.
 */

import Constants from 'expo-constants';

const localhost =
    Constants.expoConfig?.hostUri?.split(':').shift() || 'localhost';
console.log(localhost)
const ENV = {
    development: {
        BASE_URL: `http://${localhost}:8080/api`,
        IMAGE_URL: `http://${localhost}:8080/uploads`,
    },
    production: {
        BASE_URL: 'https://dirty-colts-hug.loca.lt/api',
        IMAGE_URL: 'https://cdn.gshop.vn/uploads',
    },
};

// ⚙️ Tự động chọn môi trường dựa vào NODE_ENV
const currentEnv =
    process.env.NODE_ENV === 'production' ? ENV.production : ENV.development;

export const APP_CONFIG = {
    ...currentEnv,

    // ✅ Endpoint nhóm theo domain logic
    API: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            PROFILE: '/users/profile',
            REFRESH: '/auth/refresh',
        },
        PRODUCTS: {
            BASE: '/products',
            NEWEST: '/products/newest',
            TREND: '/products/trending',
            FLASH: '/products/flash-sale',
            DETAIL: (id: number) => `/products/${id}`,
        },
        CART: {
            BASE: '/cart',
            ADD: '/cart/add',
            REMOVE: (id: number) => `/cart/${id}`,
            CHECKOUT: '/cart/checkout',
        },
        ORDERS: {
            BASE: '/orders',
            HISTORY: '/orders/history',
            DETAIL: (id: number) => `/orders/${id}`,
        },
        USERS: {
            BASE: '/users',
            DETAIL: (id: number) => `/users/${id}`,
        },
        CATEGORIES: {
            BASE: '/products/categories',
        },
    },
};
