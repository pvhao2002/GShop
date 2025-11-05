import React, { useState, useEffect } from 'react';
import { Box, ScrollView, VStack, Text, HStack, useToast, Spinner, Center } from 'native-base';
import { LineChart, BarChart, PieChart, AreaChart } from '../../components/charts';
import { DateRangePicker, AnalyticsCard, DateRange } from '../../components/analytics';
import { analyticsService, SalesAnalytics, ProductAnalytics, CustomerAnalytics } from '../../services/analyticsService';

export const StatisticsScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesAnalytics | null>(null);
  const [productData, setProductData] = useState<ProductAnalytics | null>(null);
  const [customerData, setCustomerData] = useState<CustomerAnalytics | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: 'Last 30 days',
  });
  
  const toast = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedDateRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // For now, use mock data. In production, this would call the API
      const sales = analyticsService.getMockSalesAnalytics();
      const products = analyticsService.getMockProductAnalytics();
      const customers = analyticsService.getMockCustomerAnalytics();
      
      setSalesData(sales);
      setProductData(products);
      setCustomerData(customers);
    } catch (error) {
      toast.show({
        title: 'Error loading analytics',
        description: 'Failed to load analytics data. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Center flex={1} bg="gray.50">
        <Spinner size="lg" color="blue.500" />
        <Text mt={2} color="gray.600">Loading analytics...</Text>
      </Center>
    );
  }

  return (
    <Box flex={1} bg="gray.50">
      <ScrollView>
        <VStack space={4} p={4}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Analytics Dashboard
          </Text>

          {/* Date Range Picker */}
          <DateRangePicker
            selectedRange={selectedDateRange}
            onRangeChange={setSelectedDateRange}
          />

          {/* Sales Analytics */}
          <VStack space={3}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Sales Performance
            </Text>
            
            <HStack space={2}>
              <AnalyticsCard
                title="Total Revenue"
                value={`$${salesData?.totalRevenue.toLocaleString()}`}
                icon="cash"
                color="#10B981"
                trend={{ value: salesData?.revenueGrowth || 0, isPositive: (salesData?.revenueGrowth || 0) > 0 }}
              />
              <AnalyticsCard
                title="Total Orders"
                value={salesData?.totalOrders || 0}
                icon="receipt"
                color="#3B82F6"
                trend={{ value: salesData?.ordersGrowth || 0, isPositive: (salesData?.ordersGrowth || 0) > 0 }}
              />
            </HStack>

            <HStack space={2}>
              <AnalyticsCard
                title="Avg Order Value"
                value={`$${salesData?.averageOrderValue}`}
                icon="card"
                color="#F59E0B"
              />
              <AnalyticsCard
                title="Conversion Rate"
                value="3.2%"
                icon="trending-up"
                color="#8B5CF6"
                trend={{ value: 0.8, isPositive: true }}
              />
            </HStack>
          </VStack>

          {/* Revenue Trends */}
          <LineChart
            data={salesData?.monthlyRevenue.map(item => ({ x: item.month, y: item.revenue })) || []}
            title="Monthly Revenue Trend"
            height={300}
            color="#10B981"
          />

          <AreaChart
            data={salesData?.dailyRevenue.map(item => ({ x: item.date.split('-')[2], y: item.revenue })) || []}
            title="Daily Revenue (Last 7 Days)"
            height={250}
            color="#3B82F6"
          />

          {/* Product Analytics */}
          <VStack space={3}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Product Performance
            </Text>

            <PieChart
              data={productData?.categoryPerformance.map(item => ({ x: item.category, y: item.percentage })) || []}
              title="Sales by Category"
              height={300}
            />

            <BarChart
              data={productData?.topSellingProducts.slice(0, 5).map(item => ({ x: item.name.substring(0, 10), y: item.totalSold })) || []}
              title="Top Selling Products"
              height={300}
              color="#10B981"
            />
          </VStack>

          {/* Inventory Status */}
          <VStack space={3}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Inventory Status
            </Text>
            
            <HStack space={2}>
              <AnalyticsCard
                title="In Stock"
                value={productData?.inventoryStatus.filter(item => item.status === 'in_stock').length || 0}
                icon="checkmark-circle"
                color="#10B981"
              />
              <AnalyticsCard
                title="Low Stock"
                value={productData?.inventoryStatus.filter(item => item.status === 'low_stock').length || 0}
                icon="warning"
                color="#F59E0B"
              />
            </HStack>

            <HStack space={2}>
              <AnalyticsCard
                title="Out of Stock"
                value={productData?.inventoryStatus.filter(item => item.status === 'out_of_stock').length || 0}
                icon="close-circle"
                color="#EF4444"
              />
              <AnalyticsCard
                title="Total Products"
                value={productData?.inventoryStatus.length || 0}
                icon="cube"
                color="#8B5CF6"
              />
            </HStack>
          </VStack>

          {/* Customer Analytics */}
          <VStack space={3}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Customer Insights
            </Text>
            
            <HStack space={2}>
              <AnalyticsCard
                title="Total Customers"
                value={customerData?.totalCustomers || 0}
                icon="people"
                color="#3B82F6"
                trend={{ value: customerData?.customerGrowth || 0, isPositive: (customerData?.customerGrowth || 0) > 0 }}
              />
              <AnalyticsCard
                title="New Customers"
                value={customerData?.newCustomers || 0}
                icon="person-add"
                color="#10B981"
              />
            </HStack>

            <HStack space={2}>
              <AnalyticsCard
                title="Retention Rate"
                value={`${customerData?.customerRetention}%`}
                icon="heart"
                color="#F59E0B"
              />
              <AnalyticsCard
                title="Avg Lifetime Value"
                value={`$${customerData?.averageLifetimeValue}`}
                icon="diamond"
                color="#8B5CF6"
              />
            </HStack>
          </VStack>

          {/* Customer Segments */}
          <PieChart
            data={customerData?.customerSegments.map(item => ({ x: item.segment, y: item.percentage })) || []}
            title="Customer Segments"
            height={300}
            colorScale={['#3B82F6', '#10B981', '#F59E0B']}
          />

          {/* Customer Activity */}
          <LineChart
            data={customerData?.customerActivity.map(item => ({ x: item.date.split('-')[2], y: item.newCustomers + item.returningCustomers })) || []}
            title="Daily Customer Activity"
            height={250}
            color="#8B5CF6"
          />
        </VStack>
      </ScrollView>
    </Box>
  );
};