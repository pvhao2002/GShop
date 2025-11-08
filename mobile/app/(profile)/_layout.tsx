import {Stack} from 'expo-router';

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name="update-profile"
                options={{title: 'About', headerShown: false}}
            />
            <Stack.Screen
                name="change-password"
                options={{title: 'About', headerShown: false}}
            />
            <Stack.Screen
                name="about"
                options={{title: 'About', headerShown: false}}
            />
            <Stack.Screen
                name="support"
                options={{title: 'Support', headerShown: false}}
            />
        </Stack>
    );
}
