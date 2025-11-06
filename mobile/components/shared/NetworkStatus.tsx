import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkState, networkHandler } from '../../utils/networkHandler';

interface NetworkStatusProps {
  showWhenOnline?: boolean;
  position?: 'top' | 'bottom';
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function NetworkStatus({ 
  showWhenOnline = false, 
  position = 'top',
  autoHide = true,
  autoHideDelay = 3000 
}: NetworkStatusProps) {
  const networkState = useNetworkState();
  const [visible, setVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const shouldShow = !networkState.isOnline || (showWhenOnline && networkState.isOnline);
    
    if (shouldShow && !visible) {
      setVisible(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide for online status
      if (networkState.isOnline && autoHide) {
        const timeout = setTimeout(() => {
          hideStatus();
        }, autoHideDelay);
        setHideTimeout(timeout);
      }
    } else if (!shouldShow && visible) {
      hideStatus();
    }

    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [networkState.isOnline, showWhenOnline, visible, autoHide, autoHideDelay]);

  const hideStatus = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  const handleRetryPress = () => {
    // Force a network check
    networkHandler.getNetworkState();
  };

  if (!visible) {
    return null;
  }

  const isOnline = networkState.isOnline;
  const backgroundColor = isOnline ? '#4A5D23' : '#D32F2F';
  const iconName = isOnline ? 'checkmark-circle-outline' : 'close-circle-outline';
  const message = isOnline 
    ? 'Connection restored' 
    : networkState.isConnected 
      ? 'No internet access'
      : 'No connection';

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: position === 'top' ? [-50, 0] : [50, 0],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        position === 'top' ? styles.topPosition : styles.bottomPosition,
        { backgroundColor, transform: [{ translateY }] }
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={iconName} size={16} color="#FFFFFF" />
        <Text style={styles.message}>{message}</Text>
        
        {networkState.retryQueueSize > 0 && (
          <Text style={styles.queueInfo}>
            ({networkState.retryQueueSize} pending)
          </Text>
        )}
      </View>

      {!isOnline && (
        <TouchableOpacity onPress={handleRetryPress} style={styles.retryButton}>
          <Ionicons name="refresh" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {isOnline && autoHide && (
        <TouchableOpacity onPress={hideStatus} style={styles.closeButton}>
          <Ionicons name="close" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1000,
    elevation: 1000,
  },
  topPosition: {
    top: 0,
    paddingTop: 50, // Account for status bar
  },
  bottomPosition: {
    bottom: 0,
    paddingBottom: 34, // Account for home indicator on iOS
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    fontFamily: 'Inter',
  },
  queueInfo: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.8,
    fontFamily: 'Inter',
  },
  retryButton: {
    padding: 4,
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});