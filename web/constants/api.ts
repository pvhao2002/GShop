// app/constants/api.ts

// 🔹 BASE URL cho backend Spring Boot
export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// 🔹 Định nghĩa các endpoint thường dùng
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login-admin`,
        REGISTER: `${API_BASE_URL}/auth/register`,
        PROFILE: `${API_BASE_URL}/auth/profile`,
    },
    CATEGORIES: {
        BASE: `${API_BASE_URL}/products/categories`,
        ADMIN: `${API_BASE_URL}/admin/categories`
    },
    PRODUCTS: {
        BASE: `${API_BASE_URL}/products`,
        ADMIN: `${API_BASE_URL}/admin/products`
    },
    USERS: {
        BASE: `${API_BASE_URL}/admin/users`,
    },
    ORDERS: {
        BASE: `${API_BASE_URL}/admin/orders`,
    },
    STATISTICS: {
        DASHBOARD: `${API_BASE_URL}/statistics/dashboard`,
        SALES: `${API_BASE_URL}/statistics/sales`,
    },
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
    }
};
