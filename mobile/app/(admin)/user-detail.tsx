import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { User, Order } from '@/types';
import { useAdminStore } from '@/store';
import adminService from '@/services/adminService';

interface UserDetails {
    user: User;
    orderHistory: Order[];
    totalSpent: number;
    orderCount: number;
}

export default function AdminUserDetail() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const { updateUserStatus } = useAdminStore();
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userId) {
            loadUserDetails();
        }
    }, [userId]);

    const loadUserDetails = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const details = await adminService.getUserDetails(userId!);
            setUserDetails(details);
        } catch (error) {
            console.error('Error loading user details:', error);
            setError('Failed to load user details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleUserStatus = async () => {
        if (!userDetails) return;

        const { user } = userDetails;
        const action = user.isActive ? 'lock' : 'unlock';
        const actionText = user.isActive ? 'Lock' : 'Unlock';
        
        Alert.alert(
            `${actionText} User Account`,
            `Are you sure you want to ${action} ${user.firstName} ${user.lastName}'s account?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: actionText,
                    style: user.isActive ? 'destructive' : 'default',
                    onPress: async () => {
                        try {
                            await adminService.updateUserStatus(user.id, !user.isActive);
                            updateUserStatus(user.id, !user.isActive);
                            setUserDetails(prev => prev ? {
                                ...prev,
                                user: { ...prev.user, isActive: !prev.user.isActive }
                            } : null);
                        } catch (error) {
                            console.error('Error updating user status:', error);
                            Alert.alert('Error', 'Failed to update user status');
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateRole = async () => {
        if (!userDetails) return;

        const { user } = userDetails;
        const newRole = user.role === 'customer' ? 'admin' : 'customer';
        
        Alert.alert(
            'Change User Role',
            `Change ${user.firstName} ${user.lastName}'s role from ${user.role} to ${newRole}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Change Role',
                    onPress: async () => {
                        try {
                            await adminService.updateUserRole(user.id, newRole);
                            setUserDetails(prev => prev ? {
                                ...prev,
                                user: { ...prev.user, role: newRole }
                            } : null);
                        } catch (error) {
                            console.error('Error updating user role:', error);
                            Alert.alert('Error', 'Failed to update user role');
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (isLoading) {
        return (
            <AdminLayout title="User Details">
                <LoadingSpinner />
            </AdminLayout>
        );
    }

    if (error || !userDetails) {
        return (
            <AdminLayout title="User Details">
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={48} color="#D32F2F" />
                    <Text style={styles.errorText}>
                        {error || 'User not found'}
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadUserDetails}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </AdminLayout>
        );
    }

    const { user, orderHistory, totalSpent, orderCount } = userDetails;

    return (
        <AdminLayout 
            title="User Details"
            showBackButton
            onBackPress={() => router.back()}
        >
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* User Info Card */}
                <View style={styles.card}>
                    <View style={styles.userHeader}>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>
                                {user.firstName} {user.lastName}
                            </Text>
                            <Text style={styles.userEmail}>{user.email}</Text>
                            {user.phone && (
                                <Text style={styles.userPhone}>{user.phone}</Text>
                            )}
                        </View>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: user.isActive ? '#E8F5E8' : '#FFF2F2' }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                { color: user.isActive ? '#2E7D32' : '#D32F2F' }
                            ]}>
                                {user.isActive ? 'Active' : 'Locked'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.userMeta}>
                        <View style={styles.metaItem}>
                            <Ionicons
                                name={user.role === 'admin' ? 'shield-checkmark' : 'person'}
                                size={16}
                                color="#666666"
                            />
                            <Text style={styles.metaText}>{user.role}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="calendar" size={16} color="#666666" />
                            <Text style={styles.metaText}>
                                Joined {formatDate(user.createdAt)}
                            </Text>
                        </View>
                    </View>

                    {user.address && (
                        <View style={styles.addressSection}>
                            <Text style={styles.sectionTitle}>Address</Text>
                            <Text style={styles.addressText}>
                                {user.address.street}
                            </Text>
                            <Text style={styles.addressText}>
                                {user.address.city}, {user.address.state} {user.address.zipCode}
                            </Text>
                            <Text style={styles.addressText}>
                                {user.address.country}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Activity Stats Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Activity Summary</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{orderCount}</Text>
                            <Text style={styles.statLabel}>Total Orders</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{formatCurrency(totalSpent)}</Text>
                            <Text style={styles.statLabel}>Total Spent</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {orderCount > 0 ? formatCurrency(totalSpent / orderCount) : '$0.00'}
                            </Text>
                            <Text style={styles.statLabel}>Avg Order</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsCard}>
                    <Text style={styles.cardTitle}>Account Actions</Text>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                { backgroundColor: user.isActive ? '#FFF2F2' : '#E8F5E8' }
                            ]}
                            onPress={handleToggleUserStatus}
                        >
                            <Ionicons
                                name={user.isActive ? 'lock-closed' : 'lock-open'}
                                size={20}
                                color={user.isActive ? '#D32F2F' : '#2E7D32'}
                            />
                            <Text style={[
                                styles.actionButtonText,
                                { color: user.isActive ? '#D32F2F' : '#2E7D32' }
                            ]}>
                                {user.isActive ? 'Lock Account' : 'Unlock Account'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.roleButton]}
                            onPress={handleUpdateRole}
                        >
                            <Ionicons
                                name={user.role === 'customer' ? 'shield-checkmark' : 'person'}
                                size={20}
                                color="#666666"
                            />
                            <Text style={styles.actionButtonText}>
                                Make {user.role === 'customer' ? 'Admin' : 'Customer'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Order History */}
                {orderHistory.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Recent Orders</Text>
                        {orderHistory.slice(0, 5).map((order) => (
                            <TouchableOpacity
                                key={order.id}
                                style={styles.orderItem}
                                onPress={() => router.push(`/(admin)/order-detail?orderId=${order.id}`)}
                            >
                                <View style={styles.orderInfo}>
                                    <Text style={styles.orderId}>#{order.id.slice(-8)}</Text>
                                    <Text style={styles.orderDate}>
                                        {formatDate(order.createdAt)}
                                    </Text>
                                </View>
                                <View style={styles.orderMeta}>
                                    <Text style={styles.orderTotal}>
                                        {formatCurrency(order.total)}
                                    </Text>
                                    <View style={[
                                        styles.orderStatusBadge,
                                        { backgroundColor: getStatusColor(order.status) }
                                    ]}>
                                        <Text style={styles.orderStatusText}>
                                            {order.status}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                        
                        {orderHistory.length > 5 && (
                            <TouchableOpacity style={styles.viewAllButton}>
                                <Text style={styles.viewAllText}>
                                    View All {orderHistory.length} Orders
                                </Text>
                                <Ionicons name="chevron-forward" size={16} color="#666666" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>
        </AdminLayout>
    );
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return '#FFF3CD';
        case 'processing': return '#CCE5FF';
        case 'shipped': return '#E1F5FE';
        case 'delivered': return '#E8F5E8';
        case 'cancelled': return '#FFF2F2';
        default: return '#F5F5F5';
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    userHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#666666',
        fontFamily: 'Inter',
        marginBottom: 2,
    },
    userPhone: {
        fontSize: 16,
        color: '#666666',
        fontFamily: 'Inter',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    userMeta: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        marginLeft: 6,
        textTransform: 'capitalize',
    },
    addressSection: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
        marginBottom: 8,
    },
    addressText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        lineHeight: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Inter',
    },
    actionsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    actionButtons: {
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    roleButton: {
        backgroundColor: '#F5F5F5',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    orderInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000',
        fontFamily: 'Inter',
        marginBottom: 2,
    },
    orderDate: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
    },
    orderMeta: {
        alignItems: 'flex-end',
    },
    orderTotal: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
        marginBottom: 4,
    },
    orderStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    orderStatusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666666',
        fontFamily: 'Inter',
        textTransform: 'capitalize',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    viewAllText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        marginRight: 4,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    errorText: {
        fontSize: 16,
        color: '#666666',
        fontFamily: 'Inter',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#000000',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Inter',
        fontWeight: '500',
    },
});