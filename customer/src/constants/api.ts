export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  
  // Product endpoints
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  PRODUCT_SEARCH: '/products/search',
  CATEGORIES: '/categories',
  
  // Order endpoints
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  
  // Payment endpoints
  PAYMENT_MOMO: '/payment/momo',
  PAYMENT_VNPAY: '/payment/vnpay',
  PAYMENT_COD: '/payment/cod',
  PAYMENT_STATUS: (orderId: string) => `/payment/${orderId}/status`,
  
  // User endpoints
  USER_PROFILE: '/user/profile',
  USER_UPDATE: '/user/update',
} as const;

export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;