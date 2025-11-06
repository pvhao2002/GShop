// Validation functions for forms and data

import { LoginCredentials, RegisterData, Address } from '../types';

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation - at least 8 characters, one uppercase, one lowercase, one number
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Phone number validation (basic format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Name validation (no numbers or special characters except spaces, hyphens, apostrophes)
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  return nameRegex.test(name.trim());
};

// Zip code validation (flexible format)
export const isValidZipCode = (zipCode: string): boolean => {
  const zipRegex = /^[\d\-\s]{3,10}$/;
  return zipRegex.test(zipCode);
};

// Login credentials validation
export const validateLoginCredentials = (credentials: LoginCredentials): string[] => {
  const errors: string[] = [];
  
  if (!credentials.email.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(credentials.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!credentials.password) {
    errors.push('Password is required');
  } else if (credentials.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  return errors;
};

// Registration data validation
export const validateRegistrationData = (data: RegisterData): string[] => {
  const errors: string[] = [];
  
  if (!data.email.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!data.password) {
    errors.push('Password is required');
  } else if (!isValidPassword(data.password)) {
    errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
  }
  
  if (!data.firstName.trim()) {
    errors.push('First name is required');
  } else if (!isValidName(data.firstName)) {
    errors.push('First name must contain only letters, spaces, hyphens, and apostrophes');
  }
  
  if (!data.lastName.trim()) {
    errors.push('Last name is required');
  } else if (!isValidName(data.lastName)) {
    errors.push('Last name must contain only letters, spaces, hyphens, and apostrophes');
  }
  
  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('Please enter a valid phone number');
  }
  
  return errors;
};

// Address validation
export const validateAddress = (address: Address): string[] => {
  const errors: string[] = [];
  
  if (!address.street.trim()) {
    errors.push('Street address is required');
  }
  
  if (!address.city.trim()) {
    errors.push('City is required');
  } else if (!isValidName(address.city)) {
    errors.push('City name must contain only letters, spaces, hyphens, and apostrophes');
  }
  
  if (!address.state.trim()) {
    errors.push('State is required');
  } else if (!isValidName(address.state)) {
    errors.push('State name must contain only letters, spaces, hyphens, and apostrophes');
  }
  
  if (!address.zipCode.trim()) {
    errors.push('Zip code is required');
  } else if (!isValidZipCode(address.zipCode)) {
    errors.push('Please enter a valid zip code');
  }
  
  if (!address.country.trim()) {
    errors.push('Country is required');
  } else if (!isValidName(address.country)) {
    errors.push('Country name must contain only letters, spaces, hyphens, and apostrophes');
  }
  
  return errors;
};

// Product validation for admin
export const validateProductData = (product: {
  name: string;
  description: string;
  price: number;
  categoryId: string;
}): string[] => {
  const errors: string[] = [];
  
  if (!product.name.trim()) {
    errors.push('Product name is required');
  } else if (product.name.trim().length < 2) {
    errors.push('Product name must be at least 2 characters long');
  } else if (product.name.trim().length > 100) {
    errors.push('Product name must be less than 100 characters');
  }
  
  if (!product.description.trim()) {
    errors.push('Product description is required');
  } else if (product.description.trim().length < 10) {
    errors.push('Product description must be at least 10 characters long');
  } else if (product.description.trim().length > 1000) {
    errors.push('Product description must be less than 1000 characters');
  }
  
  if (!product.price || product.price <= 0) {
    errors.push('Product price must be greater than 0');
  } else if (product.price > 10000) {
    errors.push('Product price must be less than $10,000');
  }
  
  if (!product.categoryId.trim()) {
    errors.push('Product category is required');
  }
  
  return errors;
};

// Validate product inventory
export const validateInventoryQuantity = (quantity: string): boolean => {
  const qty = parseInt(quantity);
  return !isNaN(qty) && qty >= 0 && qty <= 9999;
};

// Quantity validation for cart
export const isValidQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 99;
};