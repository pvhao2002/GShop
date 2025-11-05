import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useAdminNotifications } from '../hooks/useAdminNotifications';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';

// Screens
import { LoginScreen } from '../screens/auth';
import { DashboardScreen } from '../screens/dashboard';
import { ProductsScreen } from '../screens/products';
import { ProductFormScreen } from '../screens/products/ProductFormScreen';
import { CategoriesScreen } from '../screens/products/CategoriesScreen';
import { OrdersScreen, OrderDetailScreen, OrderAnalyticsScreen } from '../screens/orders';
import { UsersScreen, UserDetailScreen, UserAnalyticsScreen } from '../screens/users';
import { StatisticsScreen } from '../screens/statistics';
import { ProfileScreen } from '../screens/profile';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const ProductStack = createStackNavigator();
const OrderStack = createStackNavigator();
const UserStack = createStackNavigator();
const MainStack = createStackNavigator();

const ProductStackNavigator = () => {
  return (
    <ProductStack.Navigator screenOptions={{ headerShown: false }}>
      <ProductStack.Screen name="ProductsList" component={ProductsScreen} />
      <ProductStack.Screen name="ProductForm" component={ProductFormScreen} />
      <ProductStack.Screen name="Categories" component={CategoriesScreen} />
    </ProductStack.Navigator>
  );
};

const OrderStackNavigator = () => {
  return (
    <OrderStack.Navigator screenOptions={{ headerShown: false }}>
      <OrderStack.Screen name="OrdersList" component={OrdersScreen} />
      <OrderStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <OrderStack.Screen name="OrderAnalytics" component={OrderAnalyticsScreen} />
    </OrderStack.Navigator>
  );
};

const UserStackNavigator = () => {
  return (
    <UserStack.Navigator screenOptions={{ headerShown: false }}>
      <UserStack.Screen name="UsersList" component={UsersScreen} />
      <UserStack.Screen name="UserDetail" component={UserDetailScreen} />
      <UserStack.Screen name="UserAnalytics" component={UserAnalyticsScreen} />
    </UserStack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Products':
              iconName = focused ? 'cube' : 'cube-outline';
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Users':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Statistics':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Products" component={ProductStackNavigator} />
      <Tab.Screen name="Orders" component={OrderStackNavigator} />
      <Tab.Screen name="Users" component={UserStackNavigator} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const MainStackNavigator = () => {
  const navigation = React.useRef<any>(null);
  
  // Initialize admin notification handling
  useAdminNotifications(navigation.current);

  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Tabs" component={TabNavigator} />
      <MainStack.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen}
        options={{ headerShown: true, title: 'Notification Settings' }}
      />
    </MainStack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStackNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};