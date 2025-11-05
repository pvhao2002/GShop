import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Based on iPhone 6/7/8 dimensions
const BASE_WIDTH = 375;
const BASE_HEIGHT = 667;

export const screenData = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: SCREEN_WIDTH >= 414,
  isTablet: SCREEN_WIDTH >= 768,
};

// Scale function for responsive sizing
export const scale = (size: number): number => {
  const scaleRatio = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scaleRatio;
  
  if (screenData.isTablet) {
    return Math.round(PixelRatio.roundToNearestPixel(newSize * 0.95));
  }
  
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Vertical scale function
export const verticalScale = (size: number): number => {
  const scaleRatio = SCREEN_HEIGHT / BASE_HEIGHT;
  const newSize = size * scaleRatio;
  
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Moderate scale function (less aggressive scaling)
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Responsive spacing
export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
};

// Responsive font sizes
export const fontSizes = {
  xs: moderateScale(12),
  sm: moderateScale(14),
  md: moderateScale(16),
  lg: moderateScale(18),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  xxxl: moderateScale(32),
};

// Responsive border radius
export const borderRadius = {
  sm: scale(4),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  round: scale(50),
};

// Device type helpers
export const isSmallDevice = () => screenData.isSmallDevice;
export const isMediumDevice = () => screenData.isMediumDevice;
export const isLargeDevice = () => screenData.isLargeDevice;
export const isTablet = () => screenData.isTablet;

// Safe area helpers for different device types
export const getSafeAreaPadding = () => {
  if (screenData.isTablet) {
    return {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
    };
  }
  
  if (screenData.isSmallDevice) {
    return {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.md,
    };
  }
  
  return {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  };
};