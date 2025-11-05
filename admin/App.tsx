import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NativeBaseProvider, extendTheme } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { useAuthStore } from './src/store';
import { colors } from './src/constants';

// Extend the theme with custom colors
const theme = extendTheme({
  colors,
  config: {
    useSystemColorMode: false,
    initialColorMode: 'light',
  },
});

export default function App() {
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);

  useEffect(() => {
    // Load stored authentication on app start
    loadStoredAuth();
  }, [loadStoredAuth]);

  return (
    <SafeAreaProvider>
      <NativeBaseProvider theme={theme}>
        <StatusBar style="auto" />
        <AppNavigator />
      </NativeBaseProvider>
    </SafeAreaProvider>
  );
}
