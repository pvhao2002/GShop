import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'native-base';
import ThemedSafeAreaView from '../../components/common/ThemedSafeAreaView';
import { useTheme } from '../../context/ThemeContext';
import { fontSizes, spacing } from '../../utils/responsive';

const HomeScreen: React.FC = () => {
  const { colors, theme, setThemeMode } = useTheme();

  const toggleTheme = () => {
    setThemeMode(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemedSafeAreaView style={styles.container} applyPadding>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Home Screen</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Customer home dashboard will be implemented here
        </Text>
        <Button 
          onPress={toggleTheme} 
          style={styles.themeButton}
          variant="outline"
        >
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </Button>
      </View>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  themeButton: {
    marginTop: spacing.md,
  },
});

export default HomeScreen;