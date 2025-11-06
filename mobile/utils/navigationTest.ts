import { router } from 'expo-router';

export interface NavigationRoute {
  path: string;
  description: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  params?: Record<string, string>;
}

export const customerRoutes: NavigationRoute[] = [
  { path: '/', description: 'Root redirect' },
  { path: '/login', description: 'Customer login' },
  { path: '/register', description: 'Customer registration' },
  { path: '/forgot-password', description: 'Forgot password' },
  { path: '/(user)', description: 'Customer home', requiresAuth: true },
  { path: '/(user)/search', description: 'Product search', requiresAuth: true },
  { path: '/(user)/product/123', description: 'Product detail', requiresAuth: true, params: { id: '123' } },
  { path: '/(user)/cart', description: 'Shopping cart', requiresAuth: true },
  { path: '/(user)/checkout', description: 'Checkout', requiresAuth: true },
  { path: '/(user)/profile', description: 'User profile', requiresAuth: true },
  { path: '/(user)/order-history', description: 'Order history', requiresAuth: true },
  { path: '/(user)/order-detail', description: 'Order detail', requiresAuth: true, params: { orderId: '123' } },
];

export const adminRoutes: NavigationRoute[] = [
  { path: '/admin-login', description: 'Admin login' },
  { path: '/(admin)', description: 'Admin dashboard', requiresAuth: true, requiresAdmin: true },
  { path: '/(admin)/products', description: 'Product management', requiresAuth: true, requiresAdmin: true },
  { path: '/(admin)/orders', description: 'Order management', requiresAuth: true, requiresAdmin: true },
  { path: '/(admin)/order-detail', description: 'Admin order detail', requiresAuth: true, requiresAdmin: true, params: { orderId: '123' } },
  { path: '/(admin)/users', description: 'User management', requiresAuth: true, requiresAdmin: true },
  { path: '/(admin)/user-detail', description: 'User detail', requiresAuth: true, requiresAdmin: true, params: { userId: '123' } },
  { path: '/(admin)/categories', description: 'Category management', requiresAuth: true, requiresAdmin: true },
];

export const allRoutes = [...customerRoutes, ...adminRoutes];

export function testNavigation(route: NavigationRoute): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (route.params) {
        router.push({
          pathname: route.path as any,
          params: route.params,
        });
      } else {
        router.push(route.path as any);
      }
      resolve(true);
    } catch (error) {
      console.error(`Navigation test failed for ${route.path}:`, error);
      resolve(false);
    }
  });
}

export async function testAllRoutes(): Promise<{ passed: number; failed: number; results: Array<{ route: NavigationRoute; success: boolean }> }> {
  const results = [];
  let passed = 0;
  let failed = 0;

  for (const route of allRoutes) {
    const success = await testNavigation(route);
    results.push({ route, success });
    
    if (success) {
      passed++;
    } else {
      failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { passed, failed, results };
}

export function validateRouteStructure(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check for duplicate routes
  const routePaths = allRoutes.map(r => r.path);
  const duplicates = routePaths.filter((path, index) => routePaths.indexOf(path) !== index);
  if (duplicates.length > 0) {
    issues.push(`Duplicate routes found: ${duplicates.join(', ')}`);
  }
  
  // Check for missing required parameters
  const routesWithParams = allRoutes.filter(r => r.path.includes('[') && !r.params);
  if (routesWithParams.length > 0) {
    issues.push(`Routes with dynamic segments missing params: ${routesWithParams.map(r => r.path).join(', ')}`);
  }
  
  // Check for consistent path structure
  const inconsistentPaths = allRoutes.filter(r => {
    const path = r.path;
    if (path.startsWith('/(') && !path.includes(')')) {
      return true;
    }
    return false;
  });
  
  if (inconsistentPaths.length > 0) {
    issues.push(`Inconsistent path structure: ${inconsistentPaths.map(r => r.path).join(', ')}`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}