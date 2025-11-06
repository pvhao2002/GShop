/**
 * Theme configuration for the e-commerce clothing app
 * Following modern fashion-forward design principles
 */

import { Platform } from 'react-native';

// Fashion-forward color scheme
export const Colors = {
  light: {
    text: '#333333',
    background: '#FFFFFF',
    tint: '#000000',
    icon: '#666666',
    tabIconDefault: '#666666',
    tabIconSelected: '#000000',
    border: '#E8E8E8',
    accent: '#F5F5F5',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: '#FFFFFF',
    icon: '#CCCCCC',
    tabIconDefault: '#CCCCCC',
    tabIconSelected: '#FFFFFF',
    border: '#333333',
    accent: '#1A1A1A',
  },
};

// Typography system with fashion-forward fonts
export const Fonts = Platform.select({
  ios: {
    primary: 'Poppins',
    secondary: 'Inter',
    system: 'system-ui',
  },
  android: {
    primary: 'Poppins',
    secondary: 'Inter',
    system: 'Roboto',
  },
  default: {
    primary: 'Poppins',
    secondary: 'Inter',
    system: 'system-ui',
  },
  web: {
    primary: "'Poppins', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    secondary: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
});
