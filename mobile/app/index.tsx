import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function Index() {
    const { user, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000000" />
            </View>
        );
    }

    // If not authenticated, redirect to login
    if (!user) {
        return <Redirect href="/login" />;
    }

    // Route based on user role
    if (user.role === 'admin') {
        return <Redirect href="/(admin)" />;
    } else {
        return <Redirect href="/(user)" />;
    }
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
});