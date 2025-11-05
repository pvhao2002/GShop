import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { lightTheme, darkTheme } from './src/theme/nativeBaseTheme';
import AppNavigator from './src/navigation/AppNavigator';
import AuthProvider from './src/components/common/AuthProvider';

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const nativeBaseTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <NativeBaseProvider theme={nativeBaseTheme}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </NativeBaseProvider>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}
