// Design System Constants

export const Colors = {
  // Primary Colors
  primary: '#000000',
  secondary: '#FFFFFF',
  
  // Accent Colors
  accent: '#F5F5F5',
  accentDark: '#E8E8E8',
  
  // Status Colors
  success: '#4A5D23',
  error: '#D32F2F',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Text Colors
  text: '#333333',
  textLight: '#666666',
  textMuted: '#999999',
  
  // Background Colors
  background: '#FFFFFF',
  backgroundLight: '#F9F9F9',
  backgroundDark: '#F5F5F5',
  
  // Border Colors
  border: '#E8E8E8',
  borderLight: '#F0F0F0',
  borderDark: '#CCCCCC',
} as const;

export const Typography = {
  // Font Families
  fontPrimary: 'Poppins',
  fontSecondary: 'Inter',
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
  
  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const Spacing = {
  // Base unit: 8px
  xs: 4,
  sm: 8,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;