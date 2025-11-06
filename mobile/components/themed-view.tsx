import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string | undefined;
  darkColor?: string | undefined;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const colorProps: { light?: string; dark?: string } = {};
  if (lightColor !== undefined) colorProps.light = lightColor;
  if (darkColor !== undefined) colorProps.dark = darkColor;
  const backgroundColor = useThemeColor(colorProps, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
