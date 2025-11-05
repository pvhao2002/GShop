# E-commerce Admin App

A React Native admin application built with Expo for managing the e-commerce platform.

## Features

- **Admin Authentication**: Secure login with JWT tokens and role-based access
- **Dashboard**: Overview of key metrics, sales trends, and quick actions
- **Product Management**: CRUD operations for products and categories
- **Order Management**: View and manage customer orders with status updates
- **User Management**: Manage customer accounts and admin roles
- **Analytics**: Detailed statistics with interactive charts using Victory Native
- **Responsive Design**: Optimized for tablets and mobile devices

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Navigation library for screens and tabs
- **Zustand**: Lightweight state management
- **Native Base**: UI component library
- **Victory Native**: Charts and data visualization
- **Axios**: HTTP client for API communication
- **Expo SecureStore**: Secure token storage

## Project Structure

```
admin/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Common components (buttons, spinners, etc.)
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── management/     # Management components (tables, search)
│   │   └── charts/         # Chart components
│   ├── screens/            # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── dashboard/     # Dashboard screen
│   │   ├── products/      # Product management screens
│   │   ├── orders/        # Order management screens
│   │   ├── users/         # User management screens
│   │   └── statistics/    # Analytics screens
│   ├── navigation/        # Navigation configuration
│   ├── store/            # Zustand stores
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   └── constants/        # App constants and theme
├── assets/               # Images and static assets
└── App.tsx              # Main app component
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Navigate to the admin directory:**
   ```bash
   cd admin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Update the API base URL in `src/services/apiService.ts`
   - Set your backend server URL (default: `http://localhost:8080/api`)

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Run on device/simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## Configuration

### API Configuration

Update the base URL in `src/services/apiService.ts`:

```typescript
const BASE_URL = __DEV__ 
  ? 'http://localhost:8080/api'  // Development
  : 'https://your-api.com/api';  // Production
```

### Theme Customization

Modify colors and theme in `src/constants/colors.ts` and `App.tsx`.

## Admin Features

### Authentication
- Secure admin login with email/password
- JWT token storage using Expo SecureStore
- Role-based access control (ROLE_ADMIN required)
- Automatic token refresh and logout on expiration

### Dashboard
- Key performance metrics (sales, orders, users)
- Interactive charts showing trends and analytics
- Quick action cards for common tasks
- Real-time data refresh

### Product Management
- View all products with search and filtering
- Add new products with images and variants
- Edit existing product details
- Manage product categories and inventory

### Order Management
- View all customer orders with status filtering
- Update order status (pending, confirmed, shipped, completed)
- View detailed order information and customer details
- Process refunds and cancellations

### User Management
- View all registered users
- Manage user roles and permissions
- View user activity and order history
- Enable/disable user accounts

### Analytics & Statistics
- Sales revenue trends and forecasting
- Product performance analytics
- Customer behavior insights
- Conversion rate and retention metrics
- Interactive charts and data visualization

## Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

### Building for Production

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Configure EAS:**
   ```bash
   eas build:configure
   ```

3. **Build for Android:**
   ```bash
   eas build --platform android
   ```

4. **Build for iOS:**
   ```bash
   eas build --platform ios
   ```

## API Integration

The admin app integrates with the Spring Boot backend API. Ensure the backend is running and accessible.

### Required API Endpoints

- `POST /api/auth/login` - Admin authentication
- `GET /api/products` - Product listing
- `GET /api/orders` - Order management
- `GET /api/users` - User management
- `GET /api/statistics` - Analytics data

## Security

- JWT tokens stored securely using Expo SecureStore
- Automatic token refresh and logout on expiration
- Role-based access control for admin features
- API request/response encryption in production

## Troubleshooting

### Common Issues

1. **Metro bundler issues:**
   ```bash
   npx expo start --clear
   ```

2. **iOS simulator not opening:**
   - Ensure Xcode is installed and iOS Simulator is available
   - Try `npx expo run:ios`

3. **Android emulator issues:**
   - Ensure Android Studio and emulator are properly configured
   - Try `npx expo run:android`

4. **API connection issues:**
   - Check backend server is running
   - Verify API base URL configuration
   - Check network connectivity

### Support

For issues and questions:
1. Check the backend API documentation
2. Review Expo documentation: https://docs.expo.dev/
3. Check React Navigation docs: https://reactnavigation.org/

## Detailed Feature Guide

### Dashboard Analytics

The admin dashboard provides comprehensive business insights:

#### Key Metrics Cards
- **Total Revenue**: Real-time revenue tracking with percentage change
- **Total Orders**: Order count with trend indicators
- **Active Users**: User engagement metrics
- **Product Performance**: Best-selling products and categories

#### Interactive Charts
```typescript
// Example chart configuration
import { VictoryChart, VictoryLine, VictoryArea } from 'victory-native';

const SalesChart = ({ data }) => (
  <VictoryChart theme={VictoryTheme.material}>
    <VictoryArea
      data={data}
      x="date"
      y="sales"
      style={{
        data: { fill: "#c43a31", fillOpacity: 0.6, stroke: "#c43a31" }
      }}
    />
  </VictoryChart>
);
```

### Product Management Workflow

#### Adding New Products
1. Navigate to Products → Add Product
2. Fill required fields:
   - Product name and description
   - Category selection
   - Price and stock quantity
   - Product variants (sizes, colors)
3. Upload product images (multiple supported)
4. Set product status (active/inactive)
5. Save and publish

#### Bulk Operations
- Import products via CSV
- Bulk price updates
- Inventory adjustments
- Category reassignment

### Order Management System

#### Order Status Workflow
```
Pending → Confirmed → Processing → Shipped → Delivered
    ↓         ↓           ↓          ↓
 Cancelled  Cancelled  Cancelled  Returned
```

#### Order Processing Features
- Real-time order notifications
- Customer communication tools
- Shipping label generation
- Refund processing
- Order analytics and reporting

### User Management

#### User Roles and Permissions
- **Super Admin**: Full system access
- **Admin**: Product and order management
- **Manager**: Limited administrative access
- **Customer**: Standard user account

#### User Analytics
- Registration trends
- Activity patterns
- Purchase behavior
- Geographic distribution

## Advanced Configuration

### API Service Configuration

```typescript
// src/services/apiService.ts
import axios from 'axios';
import { getAuthToken, clearAuthToken } from '../store/authStore';

const api = axios.create({
  baseURL: __DEV__ 
    ? 'http://localhost:8080/api'
    : 'https://your-production-api.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearAuthToken();
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);
```

### State Management with Zustand

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (credentials) => {
        try {
          const response = await api.post('/auth/login', credentials);
          const { user, token } = response.data;
          
          await SecureStore.setItemAsync('authToken', token);
          set({ user, token, isAuthenticated: true });
        } catch (error) {
          throw error;
        }
      },
      
      logout: async () => {
        await SecureStore.deleteItemAsync('authToken');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: async (name) => {
          const value = await SecureStore.getItemAsync(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await SecureStore.setItemAsync(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await SecureStore.deleteItemAsync(name);
        },
      },
    }
  )
);
```

### Custom Hooks

```typescript
// src/hooks/useAdminData.ts
import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

export const useAdminData = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { stats, loading, error, refetch: fetchData };
};
```

## Troubleshooting

### Common Development Issues

#### Build and Installation Problems

1. **Metro Bundler Issues**
   ```bash
   # Clear all caches
   npx expo start --clear
   rm -rf node_modules
   npm install
   ```

2. **iOS Build Failures**
   ```bash
   # Clean iOS build
   cd ios && xcodebuild clean
   
   # Reset iOS simulator
   xcrun simctl erase all
   ```

3. **Android Build Issues**
   ```bash
   # Clean Android build
   cd android && ./gradlew clean
   
   # Reset Android emulator
   emulator -avd YOUR_AVD -wipe-data
   ```

#### Runtime Errors

1. **Chart Rendering Issues**
   ```typescript
   // Ensure Victory Native is properly configured
   import { VictoryChart } from 'victory-native';
   
   // Add error boundaries for charts
   const ChartErrorBoundary = ({ children }) => {
     // Error boundary implementation
   };
   ```

2. **Navigation Errors**
   ```typescript
   // Check navigation structure
   import { NavigationContainer } from '@react-navigation/native';
   import { createStackNavigator } from '@react-navigation/stack';
   
   // Ensure proper screen registration
   ```

3. **State Management Issues**
   ```typescript
   // Debug Zustand store
   import { subscribeWithSelector } from 'zustand/middleware';
   
   const useStore = create(
     subscribeWithSelector((set, get) => ({
       // Store implementation with debugging
     }))
   );
   ```

#### Performance Optimization

1. **Large Dataset Handling**
   ```typescript
   // Implement pagination for large lists
   const [page, setPage] = useState(1);
   const [data, setData] = useState([]);
   
   const loadMore = async () => {
     const newData = await api.get(`/data?page=${page}`);
     setData(prev => [...prev, ...newData]);
     setPage(prev => prev + 1);
   };
   ```

2. **Memory Management**
   ```typescript
   // Cleanup subscriptions and timers
   useEffect(() => {
     const subscription = someService.subscribe(callback);
     
     return () => {
       subscription.unsubscribe();
     };
   }, []);
   ```

### Production Deployment

#### Pre-deployment Checklist

- [ ] Update app version in app.json
- [ ] Configure production API endpoints
- [ ] Test all admin functions on physical devices
- [ ] Verify chart rendering on different screen sizes
- [ ] Test offline functionality
- [ ] Validate push notification setup
- [ ] Check memory usage and performance
- [ ] Test with production data volumes
- [ ] Verify security configurations
- [ ] Update app store metadata and screenshots

#### EAS Build Configuration

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "API_URL": "http://localhost:8080/api"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "API_URL": "https://staging-api.yourapp.com/api"
      }
    },
    "production": {
      "env": {
        "API_URL": "https://api.yourapp.com/api"
      }
    }
  }
}
```

#### Monitoring and Analytics

1. **Crash Reporting**
   ```bash
   # Install Sentry for crash reporting
   npx expo install @sentry/react-native
   ```

2. **Performance Monitoring**
   ```typescript
   // Add performance tracking
   import * as Analytics from 'expo-analytics';
   
   Analytics.track('admin_action', {
     action: 'product_created',
     category: 'product_management'
   });
   ```

3. **User Analytics**
   ```typescript
   // Track admin usage patterns
   const trackAdminAction = (action: string, metadata?: object) => {
     Analytics.track(`admin_${action}`, {
     timestamp: new Date().toISOString(),
       ...metadata
     });
   };
   ```

## License

This project is part of the full-stack e-commerce platform.