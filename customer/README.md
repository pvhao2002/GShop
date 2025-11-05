# GShop Customer App

A React Native mobile application built with Expo for the GShop e-commerce platform.

## Features

- 🎨 **Theme System**: Dark/Light mode with automatic system detection
- 📱 **Responsive Design**: Optimized for different screen sizes and devices
- 🔐 **Authentication**: JWT-based secure authentication
- 🛒 **Shopping Cart**: Redux-powered cart management
- 📦 **Product Browsing**: Search, filter, and browse products
- 💳 **Multiple Payment Methods**: COD, MoMo, VNPay integration
- 📱 **Push Notifications**: Order status updates
- 🔒 **Secure Storage**: Expo SecureStore for sensitive data

## Tech Stack

- **Framework**: React Native with Expo SDK 49+
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: Redux Toolkit
- **UI Library**: Native Base
- **HTTP Client**: Axios
- **Storage**: Expo SecureStore, AsyncStorage
- **Notifications**: Expo Notifications

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (buttons, loaders, etc.)
│   ├── product/        # Product-related components
│   ├── cart/           # Shopping cart components
│   └── order/          # Order-related components
├── screens/            # Screen components
│   ├── auth/           # Authentication screens
│   ├── home/           # Home dashboard
│   ├── product/        # Product listing and details
│   ├── cart/           # Cart and checkout
│   ├── order/          # Order history and tracking
│   └── profile/        # User profile and settings
├── navigation/         # Navigation configuration
├── store/              # Redux store and slices
│   ├── slices/         # Redux slices
│   └── api/            # RTK Query API slices
├── services/           # API and external services
├── context/            # React contexts (theme, etc.)
├── utils/              # Utility functions
├── constants/          # App constants and configuration
├── config/             # App configuration
└── theme/              # Theme configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Installation

1. Navigate to the customer app directory:
   ```bash
   cd customer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on specific platforms:
   ```bash
   # iOS Simulator
   npx expo start --ios
   
   # Android Emulator
   npx expo start --android
   
   # Web browser
   npx expo start --web
   ```

## Configuration

### Environment Setup

The app automatically detects the environment and configures API endpoints:

- **Development**: `http://localhost:8080/api` (iOS) / `http://10.0.2.2:8080/api` (Android)
- **Production**: Configure in `src/config/app.ts`

### Theme Configuration

The app supports three theme modes:

- **Light Mode**: Traditional light theme
- **Dark Mode**: Dark theme for low-light environments
- **Auto Mode**: Follows system theme preference

Theme settings are persisted and can be changed in the Settings screen.

## Key Features Implementation

### Authentication
- JWT token-based authentication
- Secure token storage using Expo SecureStore
- Automatic token refresh
- Role-based access control

### State Management
- Redux Toolkit for global state
- RTK Query for API caching and synchronization
- Persistent cart state
- Theme preference persistence

### Navigation
- Stack navigation for screen hierarchy
- Tab navigation for main app sections
- Deep linking support
- Authentication flow handling

### Responsive Design
- Automatic scaling based on screen size
- Tablet-optimized layouts
- Safe area handling for iOS devices
- Consistent spacing and typography

## Development Guidelines

### Code Style
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Consistent naming conventions
- Component-based architecture

### State Management
- Use Redux Toolkit for global state
- Local state for component-specific data
- RTK Query for API data fetching
- Avoid prop drilling with context when needed

### Styling
- Use Native Base components when possible
- Responsive utilities for consistent sizing
- Theme-aware styling
- Platform-specific adjustments when needed

## Testing

```bash
# Run TypeScript type checking
npx tsc --noEmit

# Run tests (when implemented)
npm test
```

## Building for Production

```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **iOS Simulator not starting**: Ensure Xcode is installed and updated
3. **Android emulator issues**: Check Android Studio AVD configuration
4. **Network requests failing**: Verify API endpoint configuration

### Debug Mode

Enable debug mode in development:
```bash
npx expo start --dev-client
```

## Contributing

1. Follow the established project structure
2. Use TypeScript for all new code
3. Implement responsive design patterns
4. Add proper error handling
5. Update documentation for new features

## Troubleshooting

### Common Issues

#### Installation and Setup

1. **Node.js Version Issues**
   ```bash
   # Check Node.js version (should be 16+)
   node --version
   
   # Update Node.js if needed
   # Use nvm for version management
   nvm install 18
   nvm use 18
   ```

2. **Expo CLI Issues**
   ```bash
   # Install/update Expo CLI
   npm install -g @expo/cli
   
   # Clear Expo cache
   npx expo install --fix
   ```

3. **Dependency Installation Failures**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

#### Development Server Issues

1. **Metro Bundler Not Starting**
   ```bash
   # Clear Metro cache
   npx expo start --clear
   
   # Reset Metro cache completely
   npx expo start --reset-cache
   ```

2. **Port Already in Use**
   ```bash
   # Start on different port
   npx expo start --port 19001
   ```

3. **QR Code Not Scanning**
   - Ensure phone and computer are on same network
   - Try using tunnel mode: `npx expo start --tunnel`
   - Use direct connection with IP address

#### Device/Simulator Issues

1. **iOS Simulator Not Opening**
   ```bash
   # Check Xcode installation
   xcode-select --install
   
   # Open simulator manually
   open -a Simulator
   
   # Run directly on iOS
   npx expo run:ios
   ```

2. **Android Emulator Issues**
   ```bash
   # Check Android SDK setup
   echo $ANDROID_HOME
   
   # Start emulator manually
   emulator -avd YOUR_AVD_NAME
   
   # Run directly on Android
   npx expo run:android
   ```

3. **Physical Device Connection**
   - Enable Developer Mode on device
   - Install Expo Go app from app store
   - Ensure device and computer on same WiFi network

#### API Connection Issues

1. **Network Request Failed**
   ```typescript
   // Check API configuration in src/config/app.ts
   const API_BASE_URL = __DEV__ 
     ? Platform.OS === 'ios' 
       ? 'http://localhost:8080/api'      // iOS Simulator
       : 'http://10.0.2.2:8080/api'      // Android Emulator
     : 'https://your-api.com/api';       // Production
   ```

2. **CORS Issues**
   - Verify backend CORS configuration
   - Check if backend is running on correct port
   - Test API endpoints with Postman/curl

3. **Authentication Failures**
   ```typescript
   // Debug token storage
   import * as SecureStore from 'expo-secure-store';
   
   const token = await SecureStore.getItemAsync('authToken');
   console.log('Stored token:', token);
   ```

#### Performance Issues

1. **Slow App Performance**
   ```bash
   # Enable Hermes engine (if not already enabled)
   # Check app.json for hermes configuration
   ```

2. **Image Loading Issues**
   - Optimize image sizes and formats
   - Implement image caching
   - Use progressive loading for large images

3. **Memory Leaks**
   - Check for unsubscribed listeners
   - Properly cleanup useEffect hooks
   - Monitor Redux store size

### Development Best Practices

#### Code Organization

1. **Component Structure**
   ```typescript
   // Use consistent component structure
   interface Props {
     // Define props interface
   }
   
   const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
     // Component logic
     return (
       // JSX
     );
   };
   
   export default ComponentName;
   ```

2. **State Management**
   ```typescript
   // Use Redux Toolkit for global state
   import { useAppSelector, useAppDispatch } from '../store/hooks';
   
   const Component = () => {
     const dispatch = useAppDispatch();
     const data = useAppSelector(state => state.feature.data);
     
     // Component logic
   };
   ```

#### Performance Optimization

1. **Image Optimization**
   ```typescript
   // Use optimized image loading
   import { Image } from 'expo-image';
   
   <Image
     source={{ uri: imageUrl }}
     placeholder={blurhash}
     contentFit="cover"
     transition={1000}
   />
   ```

2. **List Performance**
   ```typescript
   // Use FlatList for large lists
   import { FlatList } from 'react-native';
   
   <FlatList
     data={items}
     renderItem={renderItem}
     keyExtractor={(item) => item.id}
     removeClippedSubviews={true}
     maxToRenderPerBatch={10}
     windowSize={10}
   />
   ```

### Testing

#### Unit Testing Setup

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# Run tests
npm test
```

#### Component Testing Example

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../store';
import LoginScreen from '../screens/auth/LoginScreen';

describe('LoginScreen', () => {
  it('renders login form correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );
    
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });
});
```

### Building for Production

#### Expo Application Services (EAS)

1. **Setup EAS**
   ```bash
   # Install EAS CLI
   npm install -g eas-cli
   
   # Login to Expo
   eas login
   
   # Configure build
   eas build:configure
   ```

2. **Build Configuration (eas.json)**
   ```json
   {
     "cli": {
       "version": ">= 3.0.0"
     },
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal"
       },
       "production": {}
     },
     "submit": {
       "production": {}
     }
   }
   ```

3. **Build Commands**
   ```bash
   # Build for development
   eas build --profile development --platform all
   
   # Build for production
   eas build --profile production --platform all
   
   # Submit to app stores
   eas submit --platform all
   ```

#### Environment Configuration

```typescript
// src/config/environment.ts
const ENV = {
  development: {
    API_URL: 'http://localhost:8080/api',
    DEBUG: true,
  },
  production: {
    API_URL: 'https://your-api.com/api',
    DEBUG: false,
  },
};

export default ENV[__DEV__ ? 'development' : 'production'];
```

### Deployment Checklist

- [ ] Update app version in app.json
- [ ] Configure production API endpoints
- [ ] Test on physical devices
- [ ] Optimize images and assets
- [ ] Enable crash reporting
- [ ] Set up analytics tracking
- [ ] Configure push notifications
- [ ] Test payment flows
- [ ] Verify deep linking
- [ ] Update app store metadata

## License

This project is part of the GShop e-commerce platform.