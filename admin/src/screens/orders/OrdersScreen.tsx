import React, { useState, useEffect } from 'react';
import { Box, VStack, Text, HStack, Button, useToast, Spinner, Center } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar, DataTable } from '../../components/management';
import { StatusFilter, OrderStatusBadge } from '../../components/orders';
import orderService from '../../services/orderService';
import { Order, OrderFilters } from '../../types/order';

export const OrdersScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigation = useNavigation();
  const toast = useToast();

  const loadOrders = async (page: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const filters: OrderFilters = {
        page,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      if (selectedStatus) {
        filters.status = selectedStatus;
      }

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const response = await orderService.getOrders(filters);
      
      if (page === 1) {
        setOrders(response.orders);
      } else {
        setOrders(prev => [...prev, ...response.orders]);
      }
      
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to load orders. Please try again.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders(1);
  }, [selectedStatus, searchQuery]);

  const handleRefresh = () => {
    loadOrders(1, true);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      loadOrders(currentPage + 1);
    }
  };

  const handleOrderPress = (order: Order) => {
    (navigation as any).navigate('OrderDetail', { orderId: order.id });
  };

  const formatOrderData = (orders: Order[]) => {
    return orders.map(order => ({
      id: order.id,
      customer: `${order.customer.firstName} ${order.customer.lastName}`,
      total: `$${order.totalAmount.toFixed(2)}`,
      status: order.status,
      date: new Date(order.createdAt).toLocaleDateString(),
      paymentMethod: order.paymentMethod,
      itemCount: order.orderItems.length,
      originalOrder: order,
    }));
  };

  const columns = [
    { key: 'id', title: 'Order ID', width: '100px' },
    { key: 'customer', title: 'Customer', width: '150px' },
    { key: 'total', title: 'Total', width: '80px' },
    { 
      key: 'status', 
      title: 'Status', 
      width: '120px',
      render: (item: any) => <OrderStatusBadge status={item.status} />
    },
    { key: 'paymentMethod', title: 'Payment', width: '80px' },
    { key: 'itemCount', title: 'Items', width: '60px' },
    { key: 'date', title: 'Date', width: '100px' },
  ];

  if (loading && orders.length === 0) {
    return (
      <Center flex={1} bg="gray.50">
        <Spinner size="lg" />
        <Text mt={2}>Loading orders...</Text>
      </Center>
    );
  }

  return (
    <Box flex={1} bg="gray.50" p={4}>
      <VStack space={4}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Orders Management
          </Text>
          <HStack space={2}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Ionicons name="analytics-outline" size={16} />}
              onPress={() => (navigation as any).navigate('OrderAnalytics')}
            >
              Analytics
            </Button>
            <Button
              size="sm"
              variant="outline"
              onPress={handleRefresh}
              isLoading={refreshing}
            >
              Refresh
            </Button>
          </HStack>
        </HStack>

        <SearchBar
          placeholder="Search by order ID, customer name, or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <StatusFilter
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        <DataTable
          columns={columns}
          data={formatOrderData(orders)}
          keyExtractor={(item) => item.id}
          onRowPress={(item) => handleOrderPress(item.originalOrder)}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />

        {orders.length === 0 && !loading && (
          <Center py={8}>
            <Text color="gray.500" fontSize="md">
              {searchQuery || selectedStatus 
                ? 'No orders found matching your criteria' 
                : 'No orders available'}
            </Text>
          </Center>
        )}
      </VStack>
    </Box>
  );
};