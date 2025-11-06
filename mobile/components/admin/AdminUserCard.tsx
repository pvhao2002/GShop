import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@/types';

interface AdminUserCardProps {
    user: User;
    onPress: () => void;
    onToggleStatus: () => void;
}

export const AdminUserCard: React.FC<AdminUserCardProps> = ({
    user,
    onPress,
    onToggleStatus
}) => {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>
                            {user.firstName} {user.lastName}
                        </Text>
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
                    <Text style={styles.email}>{user.email}</Text>
                    {user.phone && (
                        <Text style={styles.phone}>{user.phone}</Text>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onToggleStatus}
                >
                    <Ionicons
                        name={user.isActive ? 'lock-closed' : 'lock-open'}
                        size={20}
                        color={user.isActive ? '#D32F2F' : '#2E7D32'}
                    />
                </TouchableOpacity>
            </View>
            
            <View style={styles.footer}>
                <View style={styles.roleContainer}>
                    <Ionicons
                        name={user.role === 'admin' ? 'shield-checkmark' : 'person'}
                        size={16}
                        color="#666666"
                    />
                    <Text style={styles.role}>{user.role}</Text>
                </View>
                <Text style={styles.joinDate}>
                    Joined {formatDate(user.createdAt)}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

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
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    userInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    email: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        marginBottom: 2,
    },
    phone: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    role: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        marginLeft: 4,
        textTransform: 'capitalize',
    },
    joinDate: {
        fontSize: 12,
        color: '#999999',
        fontFamily: 'Inter',
    },
});