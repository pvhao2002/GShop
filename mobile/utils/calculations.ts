// Utility functions for price calculations and cart operations

import { CartItem, OrderItem } from '../types';

// Calculate cart subtotal
export const calculateCartSubtotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
};

// Calculate order subtotal
export const calculateOrderSubtotal = (items: OrderItem[]): number => {
  return items.reduce((total, item) => {
    return total + item.totalPrice;
  }, 0);
};

// Calculate tax (10% VAT for Vietnam)
export const calculateTax = (subtotal: number, taxRate: number = 0.1): number => {
  return Math.round(subtotal * taxRate);
};

// Calculate shipping cost based on subtotal
export const calculateShipping = (subtotal: number): number => {
  // Free shipping for orders over 500,000 VND
  if (subtotal >= 500000) {
    return 0;
  }
  // Standard shipping rate
  return 30000; // 30,000 VND
};

// Calculate order total
export const calculateOrderTotal = (
  subtotal: number,
  taxRate: number = 0.1,
  shippingOverride?: number
): { tax: number; shipping: number; total: number } => {
  const tax = calculateTax(subtotal, taxRate);
  const shipping = shippingOverride !== undefined ? shippingOverride : calculateShipping(subtotal);
  const total = subtotal + tax + shipping;
  
  return { tax, shipping, total };
};

// Calculate discount amount
export const calculateDiscount = (subtotal: number, discountPercent: number): number => {
  return Math.round(subtotal * (discountPercent / 100));
};

// Apply discount to subtotal
export const applyDiscount = (subtotal: number, discountPercent: number): number => {
  const discount = calculateDiscount(subtotal, discountPercent);
  return Math.max(0, subtotal - discount);
};

// Calculate item total price
export const calculateItemTotal = (unitPrice: number, quantity: number): number => {
  return unitPrice * quantity;
};

// Calculate cart item count
export const calculateCartItemCount = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

// Check if cart qualifies for free shipping
export const qualifiesForFreeShipping = (subtotal: number): boolean => {
  return subtotal >= 500000;
};

// Calculate amount needed for free shipping
export const amountNeededForFreeShipping = (subtotal: number): number => {
  const freeShippingThreshold = 500000;
  return Math.max(0, freeShippingThreshold - subtotal);
};

// Round to nearest currency unit (VND doesn't use decimals)
export const roundCurrency = (amount: number): number => {
  return Math.round(amount);
};

// Calculate percentage of total
export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

// Calculate average order value
export const calculateAverageOrderValue = (orders: { total: number }[]): number => {
  if (orders.length === 0) return 0;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  return Math.round(totalRevenue / orders.length);
};

// Calculate conversion rate
export const calculateConversionRate = (orders: number, visitors: number): number => {
  if (visitors === 0) return 0;
  return Math.round((orders / visitors) * 100 * 100) / 100; // Round to 2 decimal places
};