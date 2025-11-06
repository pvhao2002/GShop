import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export interface NavigationGuardResult {
  canNavigate: boolean;
  redirectTo?: string;
  reason?: string;
}

export function checkAuthGuard(): NavigationGuardResult {
  const { isAuthenticated, user } = useAuthStore.getState();
  
  if (!isAuthenticated || !user) {
    return {
      canNavigate: false,
      redirectTo: '/login',
      reason: 'Authentication required'
    };
  }
  
  return { canNavigate: true };
}

export function checkAdminGuard(): NavigationGuardResult {
  const authResult = checkAuthGuard();
  if (!authResult.canNavigate) {
    return {
      canNavigate: false,
      redirectTo: '/admin-login',
      reason: 'Admin authentication required'
    };
  }
  
  const { user } = useAuthStore.getState();
  if (user?.role !== 'admin') {
    return {
      canNavigate: false,
      redirectTo: '/admin-login',
      reason: 'Admin privileges required'
    };
  }
  
  return { canNavigate: true };
}

export function checkCustomerGuard(): NavigationGuardResult {
  const authResult = checkAuthGuard();
  if (!authResult.canNavigate) {
    return authResult;
  }
  
  const { user } = useAuthStore.getState();
  if (user?.role !== 'customer') {
    return {
      canNavigate: false,
      redirectTo: '/login',
      reason: 'Customer access required'
    };
  }
  
  return { canNavigate: true };
}

export function navigateWithGuard(path: string, guardType?: 'auth' | 'admin' | 'customer'): boolean {
  let guardResult: NavigationGuardResult = { canNavigate: true };
  
  switch (guardType) {
    case 'auth':
      guardResult = checkAuthGuard();
      break;
    case 'admin':
      guardResult = checkAdminGuard();
      break;
    case 'customer':
      guardResult = checkCustomerGuard();
      break;
  }
  
  if (!guardResult.canNavigate) {
    console.warn(`Navigation blocked: ${guardResult.reason}`);
    if (guardResult.redirectTo) {
      router.replace(guardResult.redirectTo as any);
    }
    return false;
  }
  
  try {
    router.push(path as any);
    return true;
  } catch (error) {
    console.error('Navigation error:', error);
    return false;
  }
}

export function getRouteGuardType(path: string): 'auth' | 'admin' | 'customer' | null {
  // Admin routes
  if (path.startsWith('/(admin)') || path === '/admin-login') {
    return 'admin';
  }
  
  // Customer routes that require auth
  if (path.startsWith('/(user)')) {
    return 'customer';
  }
  
  // Public routes
  if (['/login', '/register', '/forgot-password', '/'].includes(path)) {
    return null;
  }
  
  // Default to auth required
  return 'auth';
}

export function validateNavigationFlow(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  try {
    // Test auth state
    const { isAuthenticated, user } = useAuthStore.getState();
    
    if (isAuthenticated && !user) {
      issues.push('Authenticated state without user data');
    }
    
    if (!isAuthenticated && user) {
      issues.push('User data exists without authentication');
    }
    
    // Test guard functions
    const authGuard = checkAuthGuard();
    const adminGuard = checkAdminGuard();
    const customerGuard = checkCustomerGuard();
    
    if (!authGuard && !adminGuard && !customerGuard) {
      issues.push('All navigation guards are failing');
    }
    
  } catch (error) {
    issues.push(`Navigation validation error: ${error}`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}