export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface UserOrderSummary {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  favoriteCategories: string[];
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: {
    role: string;
    count: number;
    percentage: number;
  }[];
  usersByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  userRegistrationTrend: {
    month: string;
    count: number;
  }[];
  topCustomers: {
    userId: string;
    userName: string;
    totalOrders: number;
    totalSpent: number;
  }[];
}

export interface UsersResponse {
  users: User[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'firstName' | 'lastName';
  sortOrder?: 'asc' | 'desc';
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  role?: 'ROLE_USER' | 'ROLE_ADMIN';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface UserDetailResponse {
  user: User;
  orderSummary: UserOrderSummary;
  recentActivity: UserActivity[];
  recentOrders: Array<{
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
}