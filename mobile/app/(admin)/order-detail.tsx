import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Order, OrderStatus, User } from '@/types';
import { formatDate, formatCurrency, formatDateTime } from '@/utils';
import adminService from '@/services/adminService';

interface OrderDetails {
    order: Order;
    customer: User;
    statusHistory: Array<{
        status: OrderStatus;
        timestamp: Date;
        note?: string;
        updatedBy: string;
    }>;
}

const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
        case 'pending':
            return '#FF9800';
        case 'processing':
            return '#2196F3';
        case 'shipped':
            return '#9C27B0';
        case 'delivered':
            return '#4CAF50';
        case 'cancelled':
            return '#F44336';
        default:
            return '#666666';
    }
};

const getStatusIcon = (status: OrderStatus): keyof typeof Ionicons.glyphMap => {
    switch (status) {
        case 'pending':
            return 'time-outline';
        case 'processing':
            return 'cog-outline';
        case 'shipped':
            return 'airplane-outline';
        case 'delivered':
            return 'checkmark-circle-outline';
        case 'cancelled':
            return 'close-circle-outline';
        default:
            return 'help-circle-outline';
    }
};

const statusOptions: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrderDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadOrderDetails();
        }
    }, [id]);

    const loadOrderDetails = async () => {
        try {
            setIsLoading(true);
            const details = await adminService.getOrderDetails(id!);
            setOrderDetails(details);
            setError(null);
        } catch (error) {
            console.error('Error loading order details:', error);
            setError('Failed to load order details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = (newStatus: OrderStatus) => {
        if (!orderDetails) return;

        Alert.prompt(
            'Update Order Status',
            `Change status to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}?\n\nOptional note:`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Update',
                    onPress: (note?: string) => updateOrderStatus(newStatus, note),
                },
            ],
            'plain-text'
        );
    };

    const updateOrderStatus = async (newStatus: OrderStatus, note?: string) => {
        if (!orderDetails) return;

        try {
            setIsUpdating(true);
            await adminService.updateOrderStatus(orderDetails.order.id, newStatus, note);
            
            // Reload order details to get updated status history
            await loadOrderDetails();
            
            Alert.alert('Success', 'Order status updated successfully');
        } catch (error) {
            console.error('Error updating order status:', error);
            Alert.alert('Error', 'Failed to update order status');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout title="Order Details" showBackButton>
                <LoadingSpinner />
            </AdminLayout>
        );
    }

    if (error || !orderDetails) {
        return (
            <AdminLayout title="Order Details" showBackButton>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
                    <Text style={styles.errorTitle}>Error Loading Order</Text>
                    <Text style={styles.errorMessage}>
                        {error || 'Order not found'}
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadOrderDetails}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </AdminLayout>
        );
    }

    const { order, customer, statusHistory } = orderDetails;

    return (
        <AdminLayout title={`Order #${order.id.slice(-8).toUpperCase()}`} showBackButton>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Order Status Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Order Status</Text>
                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}15` }]}>
                            <Ionicons name={getStatusIcon(order.status)} size={16} color={getStatusColor(order.status)} />
                            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={styles.statusActions}>
                        <Text style={styles.statusActionsLabel}>Update Status:</Text>
                        <View style={styles.statusButtons}>
                            {statusOptions.map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.statusButton,
                                        { backgroundColor: `${getStatusColor(status)}15` },
                                        order.status === status && styles.currentStatusButton,
                                    ]}
                                    onPress={() => handleStatusUpdate(status)}
                                    disabled={order.status === status || isUpdating}
                                >
                                    <Ionicons name={getStatusIcon(status)} size={14} color={getStatusColor(status)} />
                                    <Text style={[styles.statusButtonText, { color: getStatusColor(status) }]}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Customer Information */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Customer Information</Text>
                    <View style={styles.customerInfo}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Name:</Text>
                            <Text style={styles.infoValue}>
                                {customer.firstName} {customer.lastName}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email:</Text>
                            <Text style={styles.infoValue}>{customer.email}</Text>
                        </View>
                        {customer.phone && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Phone:</Text>
                                <Text style={styles.infoValue}>{customer.phone}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Shipping Address */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Shipping Address</Text>
                    <View style={styles.addressContainer}>
                        <Text style={styles.addressText}>
                            {order.shippingAddress.street}
                        </Text>
                        <Text style={styles.addressText}>
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </Text>
                        <Text style={styles.addressText}>
                            {order.shippingAddress.country}
                        </Text>
                    </View>
                </View>

                {/* Order Items */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Order Items ({order.items.length})</Text>
                    {order.items.map((item, index) => (
                        <View key={index} style={styles.orderItem}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>Product ID: {item.productId}</Text>
                                <Text style={styles.itemDetails}>
                                    Size: {item.sizeId} • Color: {item.colorId}
                                </Text>
                                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                            </View>
                            <View style={styles.itemPricing}>
                                <Text style={styles.itemUnitPrice}>
                                    {formatCurrency(item.unitPrice)} each
                                </Text>
                                <Text style={styles.itemTotalPrice}>
                                    {formatCurrency(item.totalPrice)}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Order Summary */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Order Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal:</Text>
                        <Text style={styles.summaryValue}>
                            {formatCurrency(order.subtotal)}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tax:</Text>
                        <Text style={styles.summaryValue}>
                            {formatCurrency(order.tax)}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping:</Text>
                        <Text style={styles.summaryValue}>
                            {formatCurrency(order.shipping)}
                        </Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={styles.totalValue}>
                            {formatCurrency(order.total)}
                        </Text>
                    </View>
                    <View style={styles.paymentInfo}>
                        <Text style={styles.paymentMethod}>
                            Payment Method: {order.paymentMethod.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* Status History */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Status History</Text>
                    {statusHistory.map((entry, index) => (
                        <View key={index} style={styles.historyEntry}>
                            <View style={styles.historyIcon}>
                                <Ionicons 
                                    name={getStatusIcon(entry.status)} 
                                    size={16} 
                                    color={getStatusColor(entry.status)} 
                                />
                            </View>
                            <View style={styles.historyContent}>
                                <Text style={styles.historyStatus}>
                                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                                </Text>
                                <Text style={styles.historyTimestamp}>
                                    {formatDateTime(entry.timestamp)}
                                </Text>
                                <Text style={styles.historyUpdatedBy}>
                                    Updated by: {entry.updatedBy}
                                </Text>
                                {entry.note && (
                                    <Text style={styles.historyNote}>
                                        Note: {entry.note}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        margin: 16,
        marginBottom: 0,
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
        fontFamily: 'Inter',
    },
    statusActions: {
        marginTop: 16,
    },
    statusActionsLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666666',
        fontFamily: 'Inter',
        marginBottom: 12,
    },
    statusButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    currentStatusButton: {
        opacity: 0.5,
    },
    statusButtonText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
        fontFamily: 'Inter',
    },
    customerInfo: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000000',
        fontFamily: 'Inter',
        flex: 2,
        textAlign: 'right',
    },
    addressContainer: {
        gap: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Inter',
        lineHeight: 20,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000000',
        fontFamily: 'Inter',
        marginBottom: 4,
    },
    itemDetails: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Inter',
        marginBottom: 2,
    },
    itemQuantity: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Inter',
    },
    itemPricing: {
        alignItems: 'flex-end',
    },
    itemUnitPrice: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Inter',
        marginBottom: 2,
    },
    itemTotalPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000000',
        fontFamily: 'Inter',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
        marginTop: 8,
        paddingTop: 16,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000000',
        fontFamily: 'Poppins',
    },
    paymentInfo: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    paymentMethod: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
    },
    historyEntry: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    historyIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    historyContent: {
        flex: 1,
    },
    historyStatus: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000000',
        fontFamily: 'Inter',
        marginBottom: 2,
    },
    historyTimestamp: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Inter',
        marginBottom: 2,
    },
    historyUpdatedBy: {
        fontSize: 12,
        color: '#999999',
        fontFamily: 'Inter',
        marginBottom: 4,
    },
    historyNote: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Inter',
        fontStyle: 'italic',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
        marginTop: 16,
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFFFFF',
        fontFamily: 'Inter',
    },
});