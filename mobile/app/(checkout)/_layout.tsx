import {Stack} from 'expo-router';

export default function CheckoutLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                title: 'Checkout',
                animation: 'slide_from_right',
                presentation: "card",
                gestureEnabled: true,
            }}
        >
            <Stack.Screen name="order-detail"/>
            <Stack.Screen name="checkout"/>
        </Stack>
    );
}
