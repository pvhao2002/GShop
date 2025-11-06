import React, { useState, useCallback } from 'react';
import { Image, ImageProps, View, StyleSheet, ActivityIndicator } from 'react-native';
import { optimizeImageUri } from '../../utils/performance';

interface OptimizedImageComponentProps extends Omit<ImageProps, 'source'> {
  uri: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  placeholder?: React.ReactNode;
  fallbackUri?: string;
  lazy?: boolean;
  cachePolicy?: 'memory' | 'disk' | 'memory-disk';
}

export function OptimizedImage({
  uri,
  width,
  height,
  quality = 80,
  format = 'webp',
  placeholder,
  fallbackUri,
  lazy = false,
  cachePolicy = 'memory-disk',
  style,
  onLoad,
  onError,
  ...imageProps
}: OptimizedImageComponentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy);

  const optimizedUri = optimizeImageUri({
    uri,
    width,
    height,
    quality,
    format,
  });

  const handleLoad = useCallback((event: any) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(event);
  }, [onLoad]);

  const handleError = useCallback((error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  }, [onError]);

  const handleLayout = useCallback(() => {
    if (lazy && !isVisible) {
      setIsVisible(true);
    }
  }, [lazy, isVisible]);

  // If lazy loading and not visible yet, render placeholder
  if (lazy && !isVisible) {
    return (
      <View 
        style={[styles.container, style]} 
        onLayout={handleLayout}
      >
        {placeholder || <View style={styles.placeholder} />}
      </View>
    );
  }

  // If there's an error and we have a fallback, use it
  const imageSource = hasError && fallbackUri 
    ? { uri: fallbackUri }
    : { uri: optimizedUri };

  return (
    <View style={[styles.container, style]}>
      <Image
        {...imageProps}
        source={imageSource}
        style={[styles.image, style]}
        onLoad={handleLoad}
        onError={handleError}
        resizeMode={imageProps.resizeMode || 'cover'}
      />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          {placeholder || (
            <ActivityIndicator 
              size="small" 
              color="#666666" 
            />
          )}
        </View>
      )}
    </View>
  );
}

// Memoized version for better performance
export const MemoizedOptimizedImage = React.memo(OptimizedImage);

// Hook for preloading images
export function useImagePreloader(uris: string[]) {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  
  React.useEffect(() => {
    const preloadImages = async () => {
      const promises = uris.map(uri => 
        new Promise<string>((resolve, reject) => {
          Image.prefetch(uri)
            .then(() => resolve(uri))
            .catch(() => reject(uri));
        })
      );

      try {
        const loaded = await Promise.allSettled(promises);
        const successful = loaded
          .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
          .map(result => result.value);
        
        setPreloadedImages(new Set(successful));
      } catch (error) {
        console.warn('Image preloading failed:', error);
      }
    };

    if (uris.length > 0) {
      preloadImages();
    }
  }, [uris]);

  return preloadedImages;
}

// Progressive image loading component
interface ProgressiveImageProps extends OptimizedImageComponentProps {
  lowQualityUri?: string;
  highQualityUri: string;
}

export function ProgressiveImage({
  lowQualityUri,
  highQualityUri,
  ...props
}: ProgressiveImageProps) {
  const [highQualityLoaded, setHighQualityLoaded] = useState(false);

  const handleHighQualityLoad = useCallback((event: any) => {
    setHighQualityLoaded(true);
    props.onLoad?.(event);
  }, [props.onLoad]);

  return (
    <View style={[styles.container, props.style]}>
      {/* Low quality image (loads first) */}
      {lowQualityUri && !highQualityLoaded && (
        <OptimizedImage
          {...props}
          uri={lowQualityUri}
          quality={20}
          style={[styles.image, props.style, styles.lowQualityImage]}
        />
      )}
      
      {/* High quality image (loads on top) */}
      <OptimizedImage
        {...props}
        uri={highQualityUri}
        onLoad={handleHighQualityLoad}
        style={[
          styles.image, 
          props.style,
          !highQualityLoaded && styles.hiddenImage
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#F5F5F5',
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  lowQualityImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hiddenImage: {
    opacity: 0,
  },
});