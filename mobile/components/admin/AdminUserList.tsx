import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { User } from '@/types';
import { AdminUserCard } from './AdminUserCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAdminStore } from '@/store';
import adminService from '@/services/adminService';
import { router } from 'expo-router';

interface AdminUserListProps {
    searchQuery: string;
    activeFilter: 'all' | 'active' | 'locked' | 'customers' | 'admins';
}

export const AdminUserList: React.FC<AdminUserListProps> = ({
    searchQuery,
    activeFilter
}) => {
    const { allUsers, setAllUsers, updateUserStatus, isLoading, setLoading, setError } = useAdminStore();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllUsers({
                page: 1,
                limit: 100, // Load all users for now
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });
            setAllUsers(response.users);
        } catch (error) {
            console.error('Error loading users:', error);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadUsers();
        setRefreshing(false);
    };

    const handleToggleUserStatus = async (user: User) => {
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
                        } catch (error) {
                            console.error('Error updating user status:', error);
                            Alert.alert('Error', 'Failed to update user status');
                        }
                    }
                }
            ]
        );
    };

    const handleUserPress = (user: User) => {
        router.push(`/(admin)/user-detail?userId=${user.id}`);
    };

    const getFilteredUsers = (): User[] => {
        let filtered = [...allUsers];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.firstName.toLowerCase().includes(query) ||
                user.lastName.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                (user.phone && user.phone.includes(query))
            );
        }

        // Apply status/role filter
        switch (activeFilter) {
            case 'active':
                filtered = filtered.filter(user => user.isActive);
                break;
            case 'locked':
                filtered = filtered.filter(user => !user.isActive);
                break;
            case 'customers':
                filtered = filtered.filter(user => user.role === 'customer');
                break;
            case 'admins':
                filtered = filtered.filter(user => user.role === 'admin');
                break;
            case 'all':
            default:
                // No additional filtering
                break;
        }

        return filtered;
    };

    const filteredUsers = getFilteredUsers();

    if (isLoading && allUsers.length === 0) {
        return <LoadingSpinner />;
    }

    if (filteredUsers.length === 0) {
        return (
            <EmptyState
                icon="people"
                title="No Users Found"
                description={
                    searchQuery.trim()
                        ? "No users match your search criteria"
                        : "No users available"
                }
            />
        );
    }

    return (
        <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <AdminUserCard
                    user={item}
                    onPress={() => handleUserPress(item)}
                    onToggleStatus={() => handleToggleUserStatus(item)}
                />
            )}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={['#000000']}
                    tintColor="#000000"
                />
            }
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
});