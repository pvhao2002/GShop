import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderStatus } from '@/types';

interface OrderFilters {
    status: OrderStatus | 'all';
    sortBy: 'createdAt' | 'total' | 'status';
    sortOrder: 'asc' | 'desc';
}

interface AdminOrderFiltersProps {
    filters: OrderFilters;
    onFiltersChange: (filters: OrderFilters) => void;
    orderCounts: Record<OrderStatus | 'all', number>;
}

const statusOptions: Array<{ key: OrderStatus | 'all'; label: string; color: string }> = [
    { key: 'all', label: 'All Orders', color: '#666666' },
    { key: 'pending', label: 'Pending', color: '#FF9800' },
    { key: 'processing', label: 'Processing', color: '#2196F3' },
    { key: 'shipped', label: 'Shipped', color: '#9C27B0' },
    { key: 'delivered', label: 'Delivered', color: '#4CAF50' },
    { key: 'cancelled', label: 'Cancelled', color: '#F44336' },
];

const sortOptions = [
    { key: 'createdAt', label: 'Date Created' },
    { key: 'total', label: 'Order Total' },
    { key: 'status', label: 'Status' },
];

export function AdminOrderFilters({ filters, onFiltersChange, orderCounts }: AdminOrderFiltersProps) {
    const [showSortModal, setShowSortModal] = useState(false);

    const handleStatusChange = (status: OrderStatus | 'all') => {
        onFiltersChange({ ...filters, status });
    };

    const handleSortChange = (sortBy: OrderFilters['sortBy'], sortOrder: OrderFilters['sortOrder']) => {
        onFiltersChange({ ...filters, sortBy, sortOrder });
        setShowSortModal(false);
    };



    return (
        <View style={styles.container}>
            {/* Status Filter Tabs */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.statusTabs}
                contentContainerStyle={styles.statusTabsContent}
            >
                {statusOptions.map((option) => {
                    const isActive = filters.status === option.key;
                    const count = orderCounts[option.key] || 0;
                    
                    return (
                        <TouchableOpacity
                            key={option.key}
                            style={[
                                styles.statusTab,
                                isActive && { backgroundColor: `${option.color}15` },
                                isActive && { borderColor: option.color }
                            ]}
                            onPress={() => handleStatusChange(option.key)}
                        >
                            <Text style={[
                                styles.statusTabText,
                                isActive && { color: option.color }
                            ]}>
                                {option.label}
                            </Text>
                            <View style={[
                                styles.countBadge,
                                isActive && { backgroundColor: option.color }
                            ]}>
                                <Text style={[
                                    styles.countText,
                                    isActive && { color: '#FFFFFF' }
                                ]}>
                                    {count}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Sort Button */}
            <TouchableOpacity
                style={styles.sortButton}
                onPress={() => setShowSortModal(true)}
            >
                <Ionicons name="funnel-outline" size={16} color="#666666" />
                <Text style={styles.sortButtonText}>Sort</Text>
                <Ionicons name="chevron-down" size={16} color="#666666" />
            </TouchableOpacity>

            {/* Sort Modal */}
            <Modal
                visible={showSortModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSortModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSortModal(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Sort Orders</Text>
                            <TouchableOpacity onPress={() => setShowSortModal(false)}>
                                <Ionicons name="close" size={24} color="#666666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.sortOptions}>
                            {sortOptions.map((option) => (
                                <View key={option.key} style={styles.sortOptionGroup}>
                                    <Text style={styles.sortOptionLabel}>{option.label}</Text>
                                    
                                    <TouchableOpacity
                                        style={[
                                            styles.sortOption,
                                            filters.sortBy === option.key && filters.sortOrder === 'desc' && styles.activeSortOption
                                        ]}
                                        onPress={() => handleSortChange(option.key as OrderFilters['sortBy'], 'desc')}
                                    >
                                        <Ionicons name="arrow-down" size={16} color="#666666" />
                                        <Text style={styles.sortOptionText}>Descending</Text>
                                        {filters.sortBy === option.key && filters.sortOrder === 'desc' && (
                                            <Ionicons name="checkmark" size={16} color="#4CAF50" />
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.sortOption,
                                            filters.sortBy === option.key && filters.sortOrder === 'asc' && styles.activeSortOption
                                        ]}
                                        onPress={() => handleSortChange(option.key as OrderFilters['sortBy'], 'asc')}
                                    >
                                        <Ionicons name="arrow-up" size={16} color="#666666" />
                                        <Text style={styles.sortOptionText}>Ascending</Text>
                                        {filters.sortBy === option.key && filters.sortOrder === 'asc' && (
                                            <Ionicons name="checkmark" size={16} color="#4CAF50" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    statusTabs: {
        marginBottom: 12,
    },
    statusTabsContent: {
        paddingHorizontal: 16,
    },
    statusTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        backgroundColor: '#F8F9FA',
    },
    statusTabText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666666',
        fontFamily: 'Inter',
        marginRight: 6,
    },
    countBadge: {
        backgroundColor: '#E8E8E8',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center',
    },
    countText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#666666',
        fontFamily: 'Inter',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        backgroundColor: '#F8F9FA',
    },
    sortButtonText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        marginLeft: 8,
        marginRight: 4,
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: '90%',
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
    },
    sortOptions: {
        padding: 16,
    },
    sortOptionGroup: {
        marginBottom: 20,
    },
    sortOptionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Inter',
        marginBottom: 8,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 4,
    },
    activeSortOption: {
        backgroundColor: '#F0F8F0',
    },
    sortOptionText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        marginLeft: 8,
        flex: 1,
    },
});