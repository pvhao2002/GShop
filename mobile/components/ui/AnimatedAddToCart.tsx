import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface AnimatedAddToCartProps {
  onAddToCart: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export const AnimatedAddToCart: React.FC<AnimatedAddToCartProps> = ({
  onAddToCart,
  disabled = false,
  loading = false,
  style,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);
  const iconRotation = useSharedValue(0);

  const handlePress = async () => {
    if (disabled || loading) return;

    // Button press animation
    scale.value = withSequence(
      withSpring(0.95, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Call the add to cart function
    onAddToCart();

    // Show success animation
    runOnJS(setShowSuccess)(true);
    
    // Success animation sequence
    successScale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );
    
    successOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: 1000 }),
      withTiming(0, { duration: 300 })
    );

    // Icon rotation animation
    iconRotation.value = withSequence(
      withTiming(360, { duration: 500 }),
      withTiming(0, { duration: 0 })
    );

    // Hide success state after animation
    setTimeout(() => {
      runOnJS(setShowSuccess)(false);
    }, 1500);

    // Additional haptic feedback for success
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 200);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const successAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: successScale.value }],
      opacity: successOpacity.value,
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${iconRotation.value}deg` }],
    };
  });

  if (showSuccess) {
    return (
      <Animated.View style={[styles.container, styles.successContainer, successAnimatedStyle, style]}>
        <Animated.View style={iconAnimatedStyle}>
          <Ionicons name="checkmark-circle" size={24} color="#4A5D23" />
        </Animated.View>
        <Text style={styles.successText}>Added to Cart!</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[buttonAnimatedStyle, style]}>
      <TouchableOpacity
        style={[
          styles.container,
          styles.button,
          disabled && styles.disabled,
          loading && styles.loading,
        ]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={loading ? "hourglass-outline" : "bag-add-outline"} 
          size={20} 
          color={disabled ? "#999999" : "#FFFFFF"} 
        />
        <Text style={[styles.buttonText, disabled && styles.disabledText]}>
          {loading ? 'Adding...' : 'Add to Cart'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#000000',
  },
  disabled: {
    backgroundColor: '#E8E8E8',
  },
  loading: {
    backgroundColor: '#666666',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginLeft: 8,
  },
  disabledText: {
    color: '#999999',
  },
  successContainer: {
    backgroundColor: '#F0F8E8',
    borderWidth: 1,
    borderColor: '#4A5D23',
  },
  successText: {
    color: '#4A5D23',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginLeft: 8,
  },
});