import React from 'react';
import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaViewProps } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { getSafeAreaPadding } from '../../utils/responsive';

interface ThemedSafeAreaViewProps extends SafeAreaViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  applyPadding?: boolean;
}

const ThemedSafeAreaView: React.FC<ThemedSafeAreaViewProps> = ({
  children,
  style,
  applyPadding = false,
  ...props
}) => {
  const { colors } = useTheme();
  
  const containerStyle = [
    styles.container,
    { backgroundColor: colors.background },
    applyPadding && getSafeAreaPadding(),
    style,
  ];

  return (
    <SafeAreaView style={containerStyle} {...props}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ThemedSafeAreaView;