import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  ScrollView,
  Button,
  Select,
  useToast,
  Spinner,
  Center,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from '../../components/charts';
import { StatCard } from '../../components/dashboard';
import orderService from '../../services/orderService';
import { OrderAnalytics } from '../../types/order';

export const OrderAnalyticsScreen: React.FC = () => {
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const toast = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));

      const analyticsData = await orderService.getOrderAnalytics(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to load analytics data. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#F59E0B';
      case 'CONFIRMED':
        return '#3B82F6';
      case 'SHIPPED':
        return '#8B5CF6';
      case 'COMPLETED':
        return '#10B981';
      case 'CANCELED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  if (loading) {
    return (
      <Center flex={1} bg="gray.50">
        <Spinner size="lg" />
        <Text mt={2}>Loading analytics...</Text>
      </Center>
    );
  }

  if (!analytics) {
    return (
      <Center flex={1} bg="gray.50">
        <Text>No analytics data available</Text>
      </Center>
    );
  }

  return (
    <Box flex={1} bg="gray.50">
      <ScrollView p={4}>
        <VStack space={4}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Order Analytics
            </Text>
            <Select
              selectedValue={dateRange}
              minWidth="120"
              accessibilityLabel="Choose date range"
              placeholder="Date Range"
              onValueChange={setDateRange}
            >
              <Select.Item label="Last 7 days" value="7" />
              <Select.Item label="Last 30 days" value="30" />
              <Select.Item label="Last 90 days" value="90" />
              <Select.Item label="Last 365 days" value="365" />
            </Select>
          </HStack>

          {/* Key Metrics */}
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.700">
              Key Metrics
            </Text>
            <HStack space={3}>
              <StatCard
                title="Total Orders"
                value={analytics.totalOrders.toString()}
                icon="receipt-outline"
                color="#3B82F6"
              />
              <StatCard
                title="Total Revenue"
                value={`$${analytics.totalRevenue.toFixed(2)}`}
                icon="cash-outline"
                color="#10B981"
              />
            </HStack>
            <StatCard
              title="Average Order Value"
              value={`$${analytics.averageOrderValue.toFixed(2)}`}
              icon="trending-up-outline"
              color="#8B5CF6"
            />
          </VStack>

          {/* Orders by Status */}
          <Box bg="white" p={4} rounded="lg" shadow={1}>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Orders by Status
            </Text>
            <VStack space={3}>
              {analytics.ordersByStatus.map((statusData) => (
                <HStack key={statusData.status} justifyContent="space-between" alignItems="center">
                  <HStack alignItems="center" space={2}>
                    <Box
                      w={3}
                      h={3}
                      rounded="full"
                      bg={getStatusColor(statusData.status)}
                    />
                    <Text fontWeight="medium">{statusData.status}</Text>
                  </HStack>
                  <HStack alignItems="center" space={2}>
                    <Text color="gray.600">{statusData.count} orders</Text>
                    <Text fontWeight="semibold" color="gray.800">
                      {statusData.percentage.toFixed(1)}%
                    </Text>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* Revenue Trend */}
          <Box bg="white" p={4} rounded="lg" shadow={1}>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Revenue Trend
            </Text>
            <LineChart
              data={analytics.revenueByMonth.map(item => ({
                x: item.month,
                y: item.revenue,
              }))}
              height={200}
              color="#10B981"
            />
          </Box>

          {/* Order Count Trend */}
          <Box bg="white" p={4} rounded="lg" shadow={1}>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Order Count Trend
            </Text>
            <LineChart
              data={analytics.revenueByMonth.map(item => ({
                x: item.month,
                y: item.orders,
              }))}
              height={200}
              color="#3B82F6"
            />
          </Box>

          {/* Top Customers */}
          <Box bg="white" p={4} rounded="lg" shadow={1}>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Top Customers
            </Text>
            <VStack space={3}>
              {analytics.topCustomers.slice(0, 5).map((customer, index) => (
                <HStack key={customer.customerId} justifyContent="space-between" alignItems="center">
                  <HStack alignItems="center" space={3}>
                    <Box
                      w={8}
                      h={8}
                      rounded="full"
                      bg="blue.100"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontWeight="bold" color="blue.600">
                        {index + 1}
                      </Text>
                    </Box>
                    <VStack>
                      <Text fontWeight="medium">{customer.customerName}</Text>
                      <Text color="gray.600" fontSize="sm">
                        {customer.totalOrders} orders
                      </Text>
                    </VStack>
                  </HStack>
                  <Text fontWeight="semibold" color="green.600">
                    ${customer.totalSpent.toFixed(2)}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* Export Button */}
          <Button
            leftIcon={<Ionicons name="download-outline" size={16} />}
            variant="outline"
            onPress={() => {
              // TODO: Implement export functionality
              toast.show({
                title: 'Export',
                description: 'Export functionality will be implemented soon',
              });
            }}
          >
            Export Report
          </Button>
        </VStack>
      </ScrollView>
    </Box>
  );
};