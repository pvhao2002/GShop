import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

export default function UserLayout() {
    return (
        <SafeAreaView style={styles.container}>
            <Stack screenOptions={{ 
                headerShown: false,
                contentStyle: { backgroundColor: '#FFFFFF' }
            }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="cart" />
                <Stack.Screen name="checkout" />
                <Stack.Screen name="profile" />
                <Stack.Screen name="order-history" />
                <Stack.Screen name="order-detail" />
            </Stack>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
});
