import { Platform } from 'react-native';

export const APP_CONFIG = {
  // API Configuration
  API_BASE_URL: __DEV__ 
    ? Platform.OS === 'android' 
      ? 'http://10.0.2.2:8080/api'  // Android emulator
      : 'http://localhost:8080/api'  // iOS simulator
    : 'https://your-production-api.com/api',
  
  API_TIMEOUT: 10000,
  
  // App Information
  APP_NAME: 'GShop Customer',
  APP_VERSION: '1.0.0',
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'authToken',
    USER_DATA: 'userData',
    THEME_MODE: 'themeMode',
    CART_DATA: 'cartData',
    FAVORITES: 'favorites',
  },
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  
  // Image Configuration
  IMAGE_QUALITY: 0.8,
  MAX_IMAGE_SIZE: 1024 * 1024, // 1MB
  
  // Notification Configuration
  NOTIFICATION_CHANNEL: {
    ID: 'default',
    NAME: 'Default',
    DESCRIPTION: 'Default notification channel',
  },
  
  // Payment Methods
  PAYMENT_METHODS: {
    COD: 'cod',
    MOMO: 'momo',
    VNPAY: 'vnpay',
  },
  
  // Order Status
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    SHIPPED: 'shipped',
    COMPLETED: 'completed',
    CANCELED: 'canceled',
  },
  
  // Validation Rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    PHONE_REGEX: /^[+]?[\d\s\-\(\)]{10,}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;