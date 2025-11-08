import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import 'react-native-reanimated';

import {useColorScheme} from '@/hooks/use-color-scheme';

export const unstable_settings = {
    anchor: '(tabs)',
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="(checkout)" options={{title: ''}}/>
                <Stack.Screen name="(profile)" options={{title: ''}}/>
                <Stack.Screen name="(product)" options={{title: ''}}/>
                <Stack.Screen name="(tabs)" options={{headerShown: false, title: '',}}/>
                <Stack.Screen name="modal" options={{presentation: 'modal', title: 'Modal'}}/>
                <Stack.Screen name="register" options={{title: '',}}/>
                <Stack.Screen name="login" options={{title: '',}}/>
            </Stack>
            <StatusBar style="auto"/>
        </ThemeProvider>
    );
}
