import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '../../store';
import { fetchOrders, setFilters } from '../../store/slices/orderSlice';
import { OrderCard, OrderStatusFilter } from '../../components/order';
import { Order } from '../../services/orderService';
import { MainStackParamList } from '../../navigation/MainNavigator';

type OrderHistoryScreenNavigationProp = StackNavigationProp<MainStackParamList>;

const OrderHistoryScreen: React.FC = () => {
  const navigation = useNavigation<OrderHistoryScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const {
    orders,
    loading,
    error,
    filters,
    pagination,
  } = useSelector((state: RootState) => state.order);

  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch orders when screen is focused
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchOrders(filters));
    }, [dispatch, filters])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchOrders({ ...filters, page: 1 })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh orders');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, filters]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || pagination.currentPage >= pagination.totalPages) {
      return;
    }

    setLoadingMore(true);
    try {
      const nextPage = pagination.currentPage + 1;
      await dispatch(fetchOrders({ ...filters, page: nextPage })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to load more orders');
    } finally {
      setLoadingMore(false);
    }
  }, [dispatch, filters, pagination, loadingMore]);

  const handleStatusFilter = useCallback((status: string | undefined) => {
    dispatch(setFilters({ ...filters, status, page: 1 }));
  }, [dispatch, filters]);

  const handleOrderPress = useCallback((orderId: string) => {
    navigation.navigate('OrderDetail', { orderId });
  }, [navigation]);

  const renderOrderItem = ({ item }: { item: Order }) => (
    <OrderCard order={item} onPress={handleOrderPress} />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingMoreText}>Loading more orders...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Orders Found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {filters.status 
          ? `No orders with status "${filters.status}" found.`
          : 'You haven\'t placed any orders yet.'
        }
      </Text>
    </View>
  );

  if (loading && !refreshing && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        {pagination.totalCount > 0 && (
          <Text style={styles.orderCount}>
            {pagination.totalCount} order{pagination.totalCount !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <OrderStatusFilter
        selectedStatus={filters.status}
        onStatusChange={handleStatusFilter}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={orders.length === 0 ? styles.emptyContainer : undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  orderCount: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default OrderHistoryScreen;