import { Stack } from 'expo-router';
import { AdminGuard } from '@/components/shared/AdminGuard';

export default function AdminLayoutRoot() {
    return (
        <AdminGuard>
            <Stack screenOptions={{ 
                headerShown: false,
                contentStyle: { backgroundColor: '#F8F9FA' },
                animation: 'slide_from_right',
                animationDuration: 300,
            }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="products" />
                <Stack.Screen name="orders" />
                <Stack.Screen name="users" />
                <Stack.Screen name="categories" />
            </Stack>
        </AdminGuard>
    );
}
