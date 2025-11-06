import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnimatedScreen, ErrorBoundary, NetworkStatus } from '../components/shared';
import { globalErrorHandler } from '../utils/globalErrorHandler';

export default function RootLayout() {
    const { initializeAuth } = useAuthStore();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                await initializeAuth();
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setReady(true);
            }
        };
        init();
    }, []);

    if (!ready) {
        return (
            <SafeAreaProvider>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000000" />
                </View>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <ErrorBoundary
                onError={(error, errorInfo) => {
                    globalErrorHandler.handleError(
                        error,
                        {
                            component: 'RootLayout',
                            action: 'render',
                            timestamp: new Date().toISOString(),
                            additionalData: { errorInfo },
                        },
                        'critical',
                        false // Don't show alert as ErrorBoundary will handle UI
                    );
                }}
                showDetails={__DEV__}
            >
                <Stack screenOptions={{ 
                    headerShown: false,
                    animation: 'slide_from_right',
                    animationDuration: 300,
                }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="login" />
                    <Stack.Screen name="register" />
                    <Stack.Screen name="forgot-password" />
                    <Stack.Screen name="admin-login" />
                    <Stack.Screen name="(admin)" options={{ headerShown: false }} />
                    <Stack.Screen name="(user)" options={{ headerShown: false }} />
                </Stack>
                <NetworkStatus position="top" showWhenOnline={true} />
            </ErrorBoundary>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
});
