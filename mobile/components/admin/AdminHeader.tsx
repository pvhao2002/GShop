import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

interface AdminHeaderProps {
    title: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
}

export function AdminHeader({ title, showBackButton = false, onBackPress }: AdminHeaderProps) {
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout from the admin portal?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/admin-login');
                    },
                },
            ]
        );
    };

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            router.back();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                {showBackButton && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBackPress}
                    >
                        <Ionicons name="arrow-back" size={24} color="#000000" />
                    </TouchableOpacity>
                )}
                <Text style={styles.title}>{title}</Text>
            </View>

            <View style={styles.rightSection}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text style={styles.userRole}>Admin</Text>
                </View>
                
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userInfo: {
        alignItems: 'flex-end',
        marginRight: 12,
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Inter',
    },
    userRole: {
        fontSize: 12,
        color: '#4A5D23',
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    logoutButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#FFEBEE',
    },
});