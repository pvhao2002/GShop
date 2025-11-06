import { InteractionManager, Platform } from 'react-native';
import React, { ComponentType, lazy, Suspense } from 'react';

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private renderTimes: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(key: string): void {
    this.metrics.set(key, Date.now());
  }

  endTiming(key: string): number {
    const startTime = this.metrics.get(key);
    if (!startTime) {
      console.warn(`No start time found for key: ${key}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.metrics.delete(key);
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${key} took ${duration}ms`);
    }

    return duration;
  }

  recordRenderTime(componentName: string, renderTime: number): void {
    this.renderTimes.set(componentName, renderTime);
    
    // Log slow renders
    if (renderTime > 16) { // 60fps = 16.67ms per frame
      console.warn(`Slow render detected: ${componentName} took ${renderTime}ms`);
    }
  }

  getMetrics(): { [key: string]: number } {
    return Object.fromEntries(this.renderTimes);
  }

  clearMetrics(): void {
    this.metrics.clear();
    this.renderTimes.clear();
  }
}

// Lazy loading utilities
export function createLazyComponent<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
): React.ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFunction);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback ? React.createElement(fallback) : null}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Image optimization
export interface OptimizedImageProps {
  uri: string;
  width?: number | undefined;
  height?: number | undefined;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export function optimizeImageUri({
  uri,
  width,
  height,
  quality = 80,
  format = 'webp'
}: OptimizedImageProps): string {
  // If it's a local image, return as-is
  if (!uri.startsWith('http')) {
    return uri;
  }

  // For external images, you could use a service like Cloudinary or ImageKit
  // This is a placeholder implementation
  const params = new URLSearchParams();
  
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  if (quality) params.append('q', quality.toString());
  if (format) params.append('f', format);

  // Example with a hypothetical image optimization service
  // return `https://your-image-service.com/optimize?url=${encodeURIComponent(uri)}&${params.toString()}`;
  
  // For now, return original URI
  return uri;
}

// Memory management
export function runAfterInteractions<T>(callback: () => T): Promise<T> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      resolve(callback());
    });
  });
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): T {
  let timeout: NodeJS.Timeout | null = null;
  
  return ((...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  }) as T;
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}

// Bundle size optimization
export function isLowEndDevice(): boolean {
  // Simple heuristic for detecting low-end devices
  if (Platform.OS === 'android') {
    // You could use react-native-device-info for more accurate detection
    return false; // Placeholder
  }
  return false;
}

export function shouldUseReducedAnimations(): boolean {
  // Check if user prefers reduced motion or device is low-end
  return isLowEndDevice();
}

// React performance hooks
export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();
  
  React.useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const renderTime = Date.now() - startTime;
      monitor.recordRenderTime(componentName, renderTime);
    };
  }, [componentName, monitor]);
}

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottledValue<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// List optimization
export interface VirtualizedListConfig {
  itemHeight: number;
  windowSize?: number;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  updateCellsBatchingPeriod?: number;
}

export function getOptimizedListProps(config: VirtualizedListConfig) {
  return {
    getItemLayout: (_: any, index: number) => ({
      length: config.itemHeight,
      offset: config.itemHeight * index,
      index,
    }),
    windowSize: config.windowSize || 10,
    initialNumToRender: config.initialNumToRender || 10,
    maxToRenderPerBatch: config.maxToRenderPerBatch || 10,
    updateCellsBatchingPeriod: config.updateCellsBatchingPeriod || 50,
    removeClippedSubviews: true,
    keyExtractor: (item: any, index: number) => item.id?.toString() || index.toString(),
  };
}

// Memory leak prevention
export function useAsyncEffect(
  effect: () => Promise<void | (() => void)>,
  deps: React.DependencyList
) {
  React.useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | void;

    const runEffect = async () => {
      try {
        cleanup = await effect();
      } catch (error) {
        if (!cancelled) {
          console.error('Async effect error:', error);
        }
      }
    };

    runEffect();

    return () => {
      cancelled = true;
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, deps);
}

// Performance measurement HOC
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;
  
  const PerformanceMonitoredComponent = (props: P) => {
    usePerformanceMonitor(displayName);
    return React.createElement(WrappedComponent, props);
  };

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  
  return PerformanceMonitoredComponent;
}