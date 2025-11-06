import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    RefreshControl,
    Text,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Order, OrderStatus } from '@/types';
import { useAdminStore } from '@/store/adminStore';
import adminService from '@/services/adminService';
import { AdminOrderCard } from './AdminOrderCard';
import { AdminOrderFilters } from './AdminOrderFilters';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface OrderFilters {
    status: OrderStatus | 'all';
    sortBy: 'createdAt' | 'total' | 'status';
    sortOrder: 'asc' | 'desc';
}

interface AdminOrderListProps {
    onOrderPress?: (order: Order) => void;
}

export function AdminOrderList({ onOrderPress }: AdminOrderListProps) {
    const router = useRouter();
    const { allOrders, setAllOrders, updateOrderStatus, isLoading, setLoading, setError } = useAdminStore();
    
    const [filters, setFilters] = useState<OrderFilters>({
        status: 'all',
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Calculate order counts for filter tabs
    const orderCounts = React.useMemo(() => {
        const counts: Record<OrderStatus | 'all', number> = {
            all: allOrders.length,
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
        };

        allOrders.forEach(order => {
            counts[order.status]++;
        });

        return counts;
    }, [allOrders]);

    // Filter and sort orders
    const filteredOrders = React.useMemo(() => {
        let filtered = [...allOrders];

        // Filter by status
        if (filters.status !== 'all') {
            filtered = filtered.filter(order => order.status === filters.status);
        }

        // Sort orders
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (filters.sortBy) {
                case 'createdAt':
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
                case 'total':
                    aValue = a.total;
                    bValue = b.total;
                    break;
                case 'status':
                    const statusOrder = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
                    aValue = statusOrder.indexOf(a.status);
                    bValue = statusOrder.indexOf(b.status);
                    break;
                default:
                    return 0;
            }

            if (filters.sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return filtered;
    }, [allOrders, filters]);

    const loadOrders = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
        try {
            if (pageNum === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const params = {
                page: pageNum,
                limit: 20,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
                ...(filters.status !== 'all' && { status: filters.status }),
            };

            const response = await adminService.getAllOrders(params);
            
            if (isRefresh || pageNum === 1) {
                setAllOrders(response.orders);
            } else {
                setAllOrders([...allOrders, ...response.orders]);
            }

            setHasMore(response.page < response.totalPages);
            setPage(pageNum);
            setError(null);
        } catch (error) {
            console.error('Error loading orders:', error);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, [filters, allOrders, setAllOrders, setLoading, setError]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadOrders(1, true);
    }, [loadOrders]);

    const handleLoadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            loadOrders(page + 1);
        }
    }, [loadOrders, loadingMore, hasMore, page]);

    const handleOrderPress = (order: Order) => {
        if (onOrderPress) {
            onOrderPress(order);
        } else {
            router.push(`/(admin)/order-detail?id=${order.id}`);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await adminService.updateOrderStatus(orderId, newStatus);
            updateOrderStatus(orderId, newStatus);
        } catch (error) {
            console.error('Error updating order status:', error);
            setError('Failed to update order status');
        }
    };

    const handleFiltersChange = (newFilters: OrderFilters) => {
        setFilters(newFilters);
        setPage(1);
        setHasMore(true);
    };

    useEffect(() => {
        loadOrders(1, true);
    }, [filters.status, filters.sortBy, filters.sortOrder]);

    const renderOrderItem = ({ item }: { item: Order }) => (
        <AdminOrderCard
            order={item}
            onPress={() => handleOrderPress(item)}
            onStatusUpdate={handleStatusUpdate}
        />
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color="#2196F3" />
                <Text style={styles.loadingText}>Loading more orders...</Text>
            </View>
        );
    };

    const renderEmpty = () => {
        if (isLoading) return null;
        
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Orders Found</Text>
                <Text style={styles.emptyMessage}>
                    {filters.status === 'all' 
                        ? 'No orders have been placed yet.'
                        : `No ${filters.status} orders found.`
                    }
                </Text>
            </View>
        );
    };

    if (isLoading && allOrders.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <View style={styles.container}>
            <AdminOrderFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                orderCounts={orderCounts}
            />
            
            <FlatList
                data={filteredOrders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#2196F3']}
                        tintColor="#2196F3"
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    loadingFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
    },
    loadingText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        textAlign: 'center',
        lineHeight: 20,
    },
});