import { Platform } from 'react-native';

export interface OptimizationConfig {
  // Image optimization
  images: {
    defaultQuality: number;
    lowEndQuality: number;
    maxWidth: number;
    maxHeight: number;
    enableWebP: boolean;
    enableLazyLoading: boolean;
    preloadCount: number;
  };
  
  // List optimization
  lists: {
    windowSize: number;
    initialNumToRender: number;
    maxToRenderPerBatch: number;
    updateCellsBatchingPeriod: number;
    removeClippedSubviews: boolean;
  };
  
  // Animation optimization
  animations: {
    enableReducedMotion: boolean;
    defaultDuration: number;
    reducedDuration: number;
    enableNativeDriver: boolean;
  };
  
  // Network optimization
  network: {
    timeout: number;
    maxRetries: number;
    retryDelay: number;
    enableCaching: boolean;
    cacheSize: number;
  };
  
  // Bundle optimization
  bundle: {
    enableCodeSplitting: boolean;
    enableLazyLoading: boolean;
    chunkSize: number;
  };
  
  // Memory optimization
  memory: {
    enableGarbageCollection: boolean;
    maxCacheSize: number;
    cleanupInterval: number;
  };
}

// Default configuration
const defaultConfig: OptimizationConfig = {
  images: {
    defaultQuality: 80,
    lowEndQuality: 60,
    maxWidth: 1024,
    maxHeight: 1024,
    enableWebP: Platform.OS === 'android',
    enableLazyLoading: true,
    preloadCount: 5,
  },
  
  lists: {
    windowSize: 10,
    initialNumToRender: 10,
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
    removeClippedSubviews: true,
  },
  
  animations: {
    enableReducedMotion: false,
    defaultDuration: 300,
    reducedDuration: 150,
    enableNativeDriver: true,
  },
  
  network: {
    timeout: 10000,
    maxRetries: 3,
    retryDelay: 1000,
    enableCaching: true,
    cacheSize: 50 * 1024 * 1024, // 50MB
  },
  
  bundle: {
    enableCodeSplitting: true,
    enableLazyLoading: true,
    chunkSize: 1024 * 1024, // 1MB
  },
  
  memory: {
    enableGarbageCollection: true,
    maxCacheSize: 100 * 1024 * 1024, // 100MB
    cleanupInterval: 5 * 60 * 1000, // 5 minutes
  },
};

// Low-end device configuration
const lowEndConfig: OptimizationConfig = {
  ...defaultConfig,
  images: {
    ...defaultConfig.images,
    defaultQuality: 60,
    lowEndQuality: 40,
    maxWidth: 512,
    maxHeight: 512,
    preloadCount: 3,
  },
  
  lists: {
    ...defaultConfig.lists,
    windowSize: 5,
    initialNumToRender: 5,
    maxToRenderPerBatch: 5,
  },
  
  animations: {
    ...defaultConfig.animations,
    enableReducedMotion: true,
    defaultDuration: 200,
    reducedDuration: 100,
  },
  
  network: {
    ...defaultConfig.network,
    timeout: 15000,
    cacheSize: 25 * 1024 * 1024, // 25MB
  },
  
  memory: {
    ...defaultConfig.memory,
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    cleanupInterval: 2 * 60 * 1000, // 2 minutes
  },
};

// High-end device configuration
const highEndConfig: OptimizationConfig = {
  ...defaultConfig,
  images: {
    ...defaultConfig.images,
    defaultQuality: 90,
    maxWidth: 2048,
    maxHeight: 2048,
    preloadCount: 10,
  },
  
  lists: {
    ...defaultConfig.lists,
    windowSize: 15,
    initialNumToRender: 15,
    maxToRenderPerBatch: 15,
  },
  
  network: {
    ...defaultConfig.network,
    cacheSize: 100 * 1024 * 1024, // 100MB
  },
  
  memory: {
    ...defaultConfig.memory,
    maxCacheSize: 200 * 1024 * 1024, // 200MB
    cleanupInterval: 10 * 60 * 1000, // 10 minutes
  },
};

class OptimizationManager {
  private static instance: OptimizationManager;
  private config: OptimizationConfig;
  private deviceType: 'low-end' | 'mid-range' | 'high-end' = 'mid-range';

  private constructor() {
    this.detectDeviceCapabilities();
    this.config = this.getConfigForDevice();
  }

  static getInstance(): OptimizationManager {
    if (!OptimizationManager.instance) {
      OptimizationManager.instance = new OptimizationManager();
    }
    return OptimizationManager.instance;
  }

  private detectDeviceCapabilities(): void {
    // Simple device detection - in a real app, you'd use react-native-device-info
    // This is a placeholder implementation
    if (Platform.OS === 'ios') {
      // Assume iOS devices are generally higher-end
      this.deviceType = 'high-end';
    } else {
      // For Android, you'd check RAM, CPU, etc.
      this.deviceType = 'mid-range';
    }
  }

  private getConfigForDevice(): OptimizationConfig {
    switch (this.deviceType) {
      case 'low-end':
        return lowEndConfig;
      case 'high-end':
        return highEndConfig;
      default:
        return defaultConfig;
    }
  }

  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  getImageConfig() {
    return this.config.images;
  }

  getListConfig() {
    return this.config.lists;
  }

  getAnimationConfig() {
    return this.config.animations;
  }

  getNetworkConfig() {
    return this.config.network;
  }

  shouldUseReducedMotion(): boolean {
    return this.config.animations.enableReducedMotion || this.deviceType === 'low-end';
  }

  shouldUseLazyLoading(): boolean {
    return this.config.bundle.enableLazyLoading;
  }

  getOptimalImageQuality(): number {
    return this.deviceType === 'low-end' 
      ? this.config.images.lowEndQuality 
      : this.config.images.defaultQuality;
  }

  getOptimalListProps() {
    const listConfig = this.config.lists;
    return {
      windowSize: listConfig.windowSize,
      initialNumToRender: listConfig.initialNumToRender,
      maxToRenderPerBatch: listConfig.maxToRenderPerBatch,
      updateCellsBatchingPeriod: listConfig.updateCellsBatchingPeriod,
      removeClippedSubviews: listConfig.removeClippedSubviews,
    };
  }

  getOptimalAnimationDuration(): number {
    return this.shouldUseReducedMotion() 
      ? this.config.animations.reducedDuration 
      : this.config.animations.defaultDuration;
  }
}

// Export singleton instance
export const optimizationManager = OptimizationManager.getInstance();

// Convenience functions
export function getOptimizationConfig(): OptimizationConfig {
  return optimizationManager.getConfig();
}

export function shouldUseReducedMotion(): boolean {
  return optimizationManager.shouldUseReducedMotion();
}

export function getOptimalImageQuality(): number {
  return optimizationManager.getOptimalImageQuality();
}

export function getOptimalListProps() {
  return optimizationManager.getOptimalListProps();
}

export function getOptimalAnimationDuration(): number {
  return optimizationManager.getOptimalAnimationDuration();
}