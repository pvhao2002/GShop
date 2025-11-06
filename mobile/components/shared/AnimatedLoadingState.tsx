import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';

interface AnimatedLoadingStateProps {
  message?: string;
  type?: 'spinner' | 'dots' | 'pulse';
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const AnimatedLoadingState: React.FC<AnimatedLoadingStateProps> = ({
  message = 'Loading...',
  type = 'spinner',
  size = 'medium',
  color = '#000000',
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    if (type === 'spinner') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
    } else if (type === 'pulse') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
    } else if (type === 'dots') {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.3, { duration: 500 })
        ),
        -1,
        true
      );
    }
  }, [type]);

  const getSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'medium':
        return 32;
      case 'large':
        return 48;
      default:
        return 32;
    }
  };

  const spinnerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const dotsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const renderSpinner = () => (
    <Animated.View style={[styles.spinner, spinnerAnimatedStyle]}>
      <View
        style={[
          styles.spinnerRing,
          {
            width: getSize(),
            height: getSize(),
            borderColor: `${color}20`,
            borderTopColor: color,
          },
        ]}
      />
    </Animated.View>
  );

  const renderPulse = () => (
    <Animated.View style={[styles.pulse, pulseAnimatedStyle]}>
      <View
        style={[
          styles.pulseCircle,
          {
            width: getSize(),
            height: getSize(),
            backgroundColor: color,
          },
        ]}
      />
    </Animated.View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {[0, 1, 2].map((index) => (
        <DotComponent
          key={index}
          delay={index * 200}
          color={color}
          size={getSize() / 3}
        />
      ))}
    </View>
  );

  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return renderSpinner();
      case 'pulse':
        return renderPulse();
      case 'dots':
        return renderDots();
      default:
        return renderSpinner();
    }
  };

  return (
    <View style={styles.container}>
      {renderLoader()}
      {message && <Text style={[styles.message, { color }]}>{message}</Text>}
    </View>
  );
};

interface DotComponentProps {
  delay: number;
  color: string;
  size: number;
}

const DotComponent: React.FC<DotComponentProps> = ({ delay, color, size }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        true
      );
    }, delay);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  spinner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerRing: {
    borderWidth: 3,
    borderRadius: 50,
  },
  pulse: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    borderRadius: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 3,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
});