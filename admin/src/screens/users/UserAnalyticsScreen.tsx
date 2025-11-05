import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  ScrollView,
  Spinner,
  useToast,
  Pressable,
  Icon,
  Badge
} from 'native-base';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from '../../components/charts';
import { StatCard } from '../../components/dashboard';
import { userService } from '../../services/userService';
import { UserAnalytics } from '../../types/user';

export const UserAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const toast = useToast();

  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserAnalytics();
      setAnalytics(response);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      toast.show({
        title: "Error",
        description: "Failed to load user analytics"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderRoleItem = ({ item }: { item: { role: string; count: number; percentage: number } }) => (
    <Box
      bg="white"
      rounded="md"
      p={3}
      mb={2}
      borderWidth={1}
      borderColor="gray.200"
    >
      <HStack justifyContent="space-between" alignItems="center">
        <VStack space={1}>
          <Text fontSize="sm" fontWeight="medium" color="gray.800">
            {item.role === 'ROLE_ADMIN' ? 'Admins' : 'Customers'}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {item.percentage.toFixed(1)}% of total users
          </Text>
        </VStack>
        <Badge colorScheme={item.role === 'ROLE_ADMIN' ? 'purple' : 'blue'} variant="solid">
          {item.count}
        </Badge>
      </HStack>
    </Box>
  );

  const renderStatusItem = ({ item }: { item: { status: string; count: number; percentage: number } }) => (
    <Box
      bg="white"
      rounded="md"
      p={3}
      mb={2}
      borderWidth={1}
      borderColor="gray.200"
    >
      <HStack justifyContent="space-between" alignItems="center">
        <VStack space={1}>
          <Text fontSize="sm" fontWeight="medium" color="gray.800">
            {item.status}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {item.percentage.toFixed(1)}% of total users
          </Text>
        </VStack>
        <Badge 
          colorScheme={
            item.status === 'ACTIVE' ? 'success' : 
            item.status === 'INACTIVE' ? 'warning' : 'error'
          } 
          variant="solid"
        >
          {item.count}
        </Badge>
      </HStack>
    </Box>
  );

  const renderTopCustomer = ({ item }: { item: { userId: string; userName: string; totalOrders: number; totalSpent: number } }) => (
    <Box
      bg="white"
      rounded="md"
      p={3}
      mb={2}
      borderWidth={1}
      borderColor="gray.200"
    >
      <HStack justifyContent="space-between" alignItems="center">
        <VStack space={1} flex={1}>
          <Text fontSize="sm" fontWeight="medium" color="gray.800">
            {item.userName}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {item.totalOrders} orders
          </Text>
        </VStack>
        <Text fontSize="sm" fontWeight="semibold" color="green.600">
          ${item.totalSpent.toFixed(2)}
        </Text>
      </HStack>
    </Box>
  );

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="gray.50">
        <Spinner size="lg" />
        <Text mt={2} color="gray.600">Loading analytics...</Text>
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="gray.50">
        <Icon as={Ionicons} name="analytics-outline" size="xl" color="gray.400" />
        <Text mt={2} fontSize="lg" color="gray.500">
          No analytics data available
        </Text>
      </Box>
    );
  }

  const registrationChartData = analytics.userRegistrationTrend.map(item => ({
    x: item.month,
    y: item.count
  }));

  return (
    <Box flex={1} bg="gray.50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={4} p={4}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center">
            <Pressable onPress={() => navigation.goBack()}>
              <Icon as={Ionicons} name="arrow-back" size="lg" color="gray.600" />
            </Pressable>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              User Analytics
            </Text>
            <Box width="24px" />
          </HStack>

          {/* Overview Stats */}
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800">
              Overview
            </Text>
            <HStack space={3}>
              <Box flex={1}>
                <StatCard
                  title="Total Users"
                  value={analytics.totalUsers.toString()}
                  icon="people"
                  color="#3B82F6"
                />
              </Box>
              <Box flex={1}>
                <StatCard
                  title="Active Users"
                  value={analytics.activeUsers.toString()}
                  icon="checkmark-circle"
                  color="#10B981"
                />
              </Box>
            </HStack>
            <StatCard
              title="New Users This Month"
              value={analytics.newUsersThisMonth.toString()}
              icon="person-add"
              color="#8B5CF6"
            />
          </VStack>

          {/* Registration Trend Chart */}
          <Box bg="white" rounded="lg" shadow={1} p={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={3}>
              User Registration Trend
            </Text>
            <LineChart
              data={registrationChartData}
              height={200}
              color="#3B82F6"
            />
          </Box>

          {/* Users by Role */}
          <Box bg="white" rounded="lg" shadow={1} p={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={3}>
              Users by Role
            </Text>
            <FlatList
              data={analytics.usersByRole}
              renderItem={renderRoleItem}
              keyExtractor={(item) => item.role}
              scrollEnabled={false}
            />
          </Box>

          {/* Users by Status */}
          <Box bg="white" rounded="lg" shadow={1} p={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={3}>
              Users by Status
            </Text>
            <FlatList
              data={analytics.usersByStatus}
              renderItem={renderStatusItem}
              keyExtractor={(item) => item.status}
              scrollEnabled={false}
            />
          </Box>

          {/* Top Customers */}
          <Box bg="white" rounded="lg" shadow={1} p={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={3}>
              Top Customers
            </Text>
            {analytics.topCustomers.length > 0 ? (
              <FlatList
                data={analytics.topCustomers}
                renderItem={renderTopCustomer}
                keyExtractor={(item) => item.userId}
                scrollEnabled={false}
              />
            ) : (
              <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                No customer data available
              </Text>
            )}
          </Box>
        </VStack>
      </ScrollView>
    </Box>
  );
};