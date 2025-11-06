import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  hapticFeedback?: boolean;
  elevation?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  style,
  disabled = false,
  hapticFeedback = true,
  elevation = 2,
}) => {
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.1);
  const translateY = useSharedValue(0);

  const handlePressIn = () => {
    if (disabled) return;
    
    scale.value = withSpring(0.98, { damping: 15 });
    shadowOpacity.value = withSpring(0.15, { damping: 15 });
    translateY.value = withSpring(1, { damping: 15 });
    
    if (hapticFeedback) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    scale.value = withSpring(1, { damping: 15 });
    shadowOpacity.value = withSpring(0.1, { damping: 15 });
    translateY.value = withSpring(0, { damping: 15 });
  };

  const handlePress = () => {
    if (disabled || !onPress) return;
    
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
      shadowOpacity: shadowOpacity.value,
    };
  });

  const cardStyle = [
    styles.card,
    {
      shadowOffset: {
        width: 0,
        height: elevation,
      },
      shadowRadius: elevation * 2,
      elevation: elevation,
    },
    style,
  ];

  if (onPress && !disabled) {
    return (
      <AnimatedTouchable
        style={[cardStyle, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={1}
      >
        {children}
      </AnimatedTouchable>
    );
  }

  return (
    <Animated.View style={[cardStyle, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});