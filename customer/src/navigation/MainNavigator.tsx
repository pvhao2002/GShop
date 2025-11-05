import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/home';
import { ProductListScreen, ProductDetailScreen, FavoritesScreen } from '../screens/product';
import { CartScreen, CheckoutScreen } from '../screens/cart';
import { OrderHistoryScreen, OrderDetailScreen } from '../screens/order';
import { ProfileScreen, SettingsScreen, AddressManagementScreen, ChangePasswordScreen } from '../screens/profile';
import NotificationPreferencesScreen from '../screens/profile/NotificationPreferencesScreen';
import { useOrderNotifications } from '../hooks/useOrderNotifications';
import { useNavigation } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Products: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  ProductDetail: { productId: string };
  Favorites: undefined;
  Checkout: undefined;
  OrderDetail: { orderId: string };
  Settings: undefined;
  AddressManagement: undefined;
  ChangePassword: undefined;
  NotificationPreferences: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductListScreen}
        options={{
          tabBarLabel: 'Products',
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrderHistoryScreen}
        options={{
          tabBarLabel: 'Orders',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  const navigation = useNavigation();
  
  // Initialize notification handling
  useOrderNotifications(navigation);

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
      />
      <Stack.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{ title: 'My Favorites' }}
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen 
        name="OrderDetail" 
        component={OrderDetailScreen}
        options={{ title: 'Order Details' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="AddressManagement" 
        component={AddressManagementScreen}
        options={{ title: 'Address Management' }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
      <Stack.Screen 
        name="NotificationPreferences" 
        component={NotificationPreferencesScreen}
        options={{ title: 'Notification Preferences' }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;