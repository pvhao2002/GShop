import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AdminUserFiltersProps {
    activeFilter: 'all' | 'active' | 'locked' | 'customers' | 'admins';
    onFilterChange: (filter: 'all' | 'active' | 'locked' | 'customers' | 'admins') => void;
    userCounts: {
        total: number;
        active: number;
        locked: number;
        customers: number;
        admins: number;
    };
}

export const AdminUserFilters: React.FC<AdminUserFiltersProps> = ({
    activeFilter,
    onFilterChange,
    userCounts
}) => {
    const filters = [
        { key: 'all' as const, label: 'All Users', count: userCounts.total, icon: 'people' },
        { key: 'active' as const, label: 'Active', count: userCounts.active, icon: 'checkmark-circle' },
        { key: 'locked' as const, label: 'Locked', count: userCounts.locked, icon: 'lock-closed' },
        { key: 'customers' as const, label: 'Customers', count: userCounts.customers, icon: 'person' },
        { key: 'admins' as const, label: 'Admins', count: userCounts.admins, icon: 'shield-checkmark' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Filter Users</Text>
            <View style={styles.filtersRow}>
                {filters.map((filter) => (
                    <TouchableOpacity
                        key={filter.key}
                        style={[
                            styles.filterButton,
                            activeFilter === filter.key && styles.activeFilterButton
                        ]}
                        onPress={() => onFilterChange(filter.key)}
                    >
                        <Ionicons
                            name={filter.icon as any}
                            size={16}
                            color={activeFilter === filter.key ? '#FFFFFF' : '#666666'}
                        />
                        <Text style={[
                            styles.filterText,
                            activeFilter === filter.key && styles.activeFilterText
                        ]}>
                            {filter.label}
                        </Text>
                        <View style={[
                            styles.countBadge,
                            activeFilter === filter.key && styles.activeCountBadge
                        ]}>
                            <Text style={[
                                styles.countText,
                                activeFilter === filter.key && styles.activeCountText
                            ]}>
                                {filter.count}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
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
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
        marginBottom: 12,
    },
    filtersRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    activeFilterButton: {
        backgroundColor: '#000000',
        borderColor: '#000000',
    },
    filterText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        marginLeft: 6,
        marginRight: 6,
    },
    activeFilterText: {
        color: '#FFFFFF',
    },
    countBadge: {
        backgroundColor: '#E0E0E0',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center',
    },
    activeCountBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    countText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666666',
        fontFamily: 'Inter',
    },
    activeCountText: {
        color: '#FFFFFF',
    },
});