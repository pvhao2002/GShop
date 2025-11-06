import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
    // const { initializeAuth } = useAuthStore();
    // const [ready, setReady] = useState(false);

    // useEffect(() => {
    //     const init = async () => {
    //         try {
    //             await initializeAuth();
    //         } catch (error) {
    //             console.error('Auth initialization error:', error);
    //         } finally {
    //             setReady(true);
    //         }
    //     };
    //     init();
    // }, []);

    // if (!ready) {
    //     return (
    //         <SafeAreaProvider>
    //             <View style={styles.loadingContainer}>
    //                 <ActivityIndicator size="large" color="#000000" />
    //             </View>
    //         </SafeAreaProvider>
    //     );
    // }

    return (
        <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
                <Stack.Screen name="forgot-password" />
                <Stack.Screen name="admin-login" />
                <Stack.Screen name="(admin)" options={{ headerShown: false }} />
                <Stack.Screen name="(user)" options={{ headerShown: false }} />
            </Stack>
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
