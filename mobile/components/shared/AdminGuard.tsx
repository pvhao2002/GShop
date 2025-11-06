import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/authService';

interface AdminGuardProps {
    children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
        const validateAdminAccess = async () => {
            try {
                // If not authenticated at all, redirect to admin login
                if (!isAuthenticated || !user) {
                    router.replace('/admin-login');
                    return;
                }

                // Check if user has admin role
                const isAdmin = await authService.isAdmin();
                if (!isAdmin) {
                    // User is authenticated but not admin, redirect to admin login
                    router.replace('/admin-login');
                    return;
                }

                // User is authenticated and is admin, allow access
                setIsValidating(false);
            } catch (error) {
                console.error('Admin validation error:', error);
                router.replace('/admin-login');
            }
        };

        // Only validate if not currently loading auth state
        if (!isLoading) {
            validateAdminAccess();
        }
    }, [isAuthenticated, user, isLoading, router]);

    // Show loading while validating admin access or auth is loading
    if (isLoading || isValidating) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A5D23" />
            </View>
        );
    }

    // If we reach here, user is authenticated and is admin
    return <>{children}</>;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
});