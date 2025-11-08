import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMemo } from 'react';
import { Platform, View, StyleSheet } from 'react-native';

export default function TabsLayout() {
    const colorScheme = useColorScheme();

    const colors = useMemo(
        () => ({
            active: colorScheme === 'dark' ? '#60a5fa' : '#2563eb',
            inactive: colorScheme === 'dark' ? '#9ca3af' : '#94a3b8',
            bg: colorScheme === 'dark' ? '#0b1220' : '#ffffff',
            border: colorScheme === 'dark' ? '#1f2937' : '#e5e7eb',
        }),
        [colorScheme]
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={['top']}>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: colors.active,
                    tabBarInactiveTintColor: colors.inactive,
                    tabBarStyle: {
                        backgroundColor: colors.bg,
                        borderTopColor: colors.border,
                        height: Platform.OS === 'ios' ? 86 : 64,
                        paddingTop: 6,
                        paddingBottom: Platform.OS === 'ios' ? 18 : 10,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="home-outline" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="product"
                    options={{
                        title: 'Product',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="shirt-outline" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="cart"
                    options={{
                        title: 'Cart',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="cart-outline" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="history"
                    options={{
                        title: 'History',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="time-outline" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="person-circle-outline" size={size} color={color} />
                        ),
                    }}
                />
            </Tabs>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
});
