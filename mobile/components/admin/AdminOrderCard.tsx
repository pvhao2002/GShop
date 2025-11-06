import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order, OrderStatus } from '@/types';
import { formatDate, formatCurrency } from '@/utils';

interface AdminOrderCardProps {
    order: Order;
    onPress: () => void;
    onStatusUpdate: (orderId: string, status: OrderStatus) => void;
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

export function AdminOrderCard({ order, onPress, onStatusUpdate }: AdminOrderCardProps) {
    const statusColor = getStatusColor(order.status);
    const statusIcon = getStatusIcon(order.status);

    const handleQuickStatusUpdate = (newStatus: OrderStatus) => {
        onStatusUpdate(order.id, newStatus);
    };

    const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
        switch (currentStatus) {
            case 'pending':
                return 'processing';
            case 'processing':
                return 'shipped';
            case 'shipped':
                return 'delivered';
            default:
                return null;
        }
    };

    const nextStatus = getNextStatus(order.status);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.header}>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
                    <Text style={styles.orderDate}>
                        {formatDate(order.createdAt)}
                    </Text>
                </View>
                
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                    <Ionicons name={statusIcon} size={16} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.orderDetails}>
                    <Text style={styles.itemCount}>
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.total}>
                        {formatCurrency(order.total)}
                    </Text>
                </View>

                <Text style={styles.paymentMethod}>
                    Payment: {order.paymentMethod.toUpperCase()}
                </Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.viewButton}
                    onPress={onPress}
                >
                    <Ionicons name="eye-outline" size={16} color="#2196F3" />
                    <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>

                {nextStatus && (
                    <TouchableOpacity
                        style={[styles.statusButton, { backgroundColor: `${getStatusColor(nextStatus)}15` }]}
                        onPress={() => handleQuickStatusUpdate(nextStatus)}
                    >
                        <Ionicons 
                            name={getStatusIcon(nextStatus)} 
                            size={16} 
                            color={getStatusColor(nextStatus)} 
                        />
                        <Text style={[styles.statusButtonText, { color: getStatusColor(nextStatus) }]}>
                            Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
        marginBottom: 2,
    },
    orderDate: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Inter',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
        fontFamily: 'Inter',
    },
    content: {
        marginBottom: 16,
    },
    orderDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemCount: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
    },
    total: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
    },
    paymentMethod: {
        fontSize: 12,
        color: '#999999',
        fontFamily: 'Inter',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
    },
    viewButtonText: {
        fontSize: 12,
        color: '#2196F3',
        fontWeight: '500',
        marginLeft: 4,
        fontFamily: 'Inter',
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    statusButtonText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
        fontFamily: 'Inter',
    },
});