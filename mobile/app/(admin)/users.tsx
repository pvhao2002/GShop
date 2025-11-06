import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminUserSearch } from '@/components/admin/AdminUserSearch';
import { AdminUserFilters } from '@/components/admin/AdminUserFilters';
import { AdminUserList } from '@/components/admin/AdminUserList';
import { useAdminStore } from '@/store';

export default function AdminUsers() {
    const { allUsers } = useAdminStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'locked' | 'customers' | 'admins'>('all');

    // Calculate user counts for filters
    const userCounts = useMemo(() => {
        const total = allUsers.length;
        const active = allUsers.filter(user => user.isActive).length;
        const locked = allUsers.filter(user => !user.isActive).length;
        const customers = allUsers.filter(user => user.role === 'customer').length;
        const admins = allUsers.filter(user => user.role === 'admin').length;

        return {
            total,
            active,
            locked,
            customers,
            admins
        };
    }, [allUsers]);

    return (
        <AdminLayout title="User Management">
            <View style={styles.container}>
                <AdminUserSearch
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                
                <AdminUserFilters
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    userCounts={userCounts}
                />
                
                <AdminUserList
                    searchQuery={searchQuery}
                    activeFilter={activeFilter}
                />
            </View>
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
});