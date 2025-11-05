import React, { useState, useEffect } from 'react';
import {
  Box,
  ScrollView,
  VStack,
  HStack,
  Text,
  Button,
  useToast
} from 'native-base';
import { RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StatCard, DashboardCard } from '../../components/dashboard';
import { LineChart } from '../../components/charts';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/apiService';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  salesTrend: number;
  ordersTrend: number;
}

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const toast = useToast();
  const { user } = useAuthStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 25430,
    totalOrders: 1234,
    totalProducts: 456,
    totalUsers: 2890,
    salesTrend: 12.5,
    ordersTrend: 8.2
  });

  const fetchDashboardData = async () => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiService.get('/admin/dashboard/stats');
      // setStats(response.data);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update with mock data that shows some variation
      setStats(prev => ({
        ...prev,
        totalSales: prev.totalSales + Math.floor(Math.random() * 1000),
        totalOrders: prev.totalOrders + Math.floor(Math.random() * 10),
      }));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.show({
        title: "Error",
        description: "Failed to load dashboard data",
        duration: 3000,
      });
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Sample data for charts
  const salesData = [
    { x: 'Jan', y: 12000 },
    { x: 'Feb', y: 15000 },
    { x: 'Mar', y: 18000 },
    { x: 'Apr', y: 22000 },
    { x: 'May', y: 25000 },
  ];

  const ordersData = [
    { x: 'Mon', y: 45 },
    { x: 'Tue', y: 52 },
    { x: 'Wed', y: 38 },
    { x: 'Thu', y: 61 },
    { x: 'Fri', y: 55 },
  ];

  return (
    <Box flex={1} bg="gray.50">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <VStack space={4} p={4}>
          {/* Header */}
          <VStack space={2}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                  Welcome back, {user?.firstName}!
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Here's what's happening with your store today
                </Text>
              </VStack>
              <Button
                variant="ghost"
                onPress={() => navigation.navigate('Profile' as never)}
                leftIcon={<Ionicons name="person-outline" size={16} />}
              >
                Profile
              </Button>
            </HStack>
          </VStack>

          {/* Stats Cards */}
          <HStack space={2}>
            <StatCard
              title="Total Sales"
              value={`$${stats.totalSales.toLocaleString()}`}
              icon="trending-up"
              color="#10B981"
              trend={{ value: stats.salesTrend, isPositive: true }}
            />
            <StatCard
              title="Orders"
              value={stats.totalOrders.toLocaleString()}
              icon="receipt"
              color="#3B82F6"
              trend={{ value: stats.ordersTrend, isPositive: true }}
            />
          </HStack>

          <HStack space={2}>
            <StatCard
              title="Products"
              value={stats.totalProducts.toLocaleString()}
              icon="cube"
              color="#F59E0B"
            />
            <StatCard
              title="Users"
              value={stats.totalUsers.toLocaleString()}
              icon="people"
              color="#8B5CF6"
              trend={{ value: 3.1, isPositive: false }}
            />
          </HStack>

          {/* Charts */}
          <LineChart
            data={salesData}
            title="Sales Trend (Last 5 Months)"
            height={250}
          />

          <LineChart
            data={ordersData}
            title="Orders This Week"
            height={250}
          />

          {/* Quick Actions */}
          <Text fontSize="lg" fontWeight="bold" color="gray.800" mt={2}>
            Quick Actions
          </Text>

          <VStack space={3}>
            <DashboardCard
              title="Manage Products"
              subtitle="Add, edit, or remove products"
              onPress={() => navigation.navigate('Products' as never)}
            />
            
            <DashboardCard
              title="View Orders"
              subtitle="Process and track customer orders"
              onPress={() => navigation.navigate('Orders' as never)}
            />
            
            <DashboardCard
              title="User Management"
              subtitle="Manage customer accounts and roles"
              onPress={() => navigation.navigate('Users' as never)}
            />
            
            <DashboardCard
              title="Analytics & Reports"
              subtitle="View detailed statistics and insights"
              onPress={() => navigation.navigate('Statistics' as never)}
            />
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
};