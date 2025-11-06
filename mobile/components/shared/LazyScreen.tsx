import React, { Suspense, ComponentType } from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonScreen } from './SkeletonScreen';
import { createLazyComponent } from '../../utils/performance';

interface LazyScreenProps {
    children: React.ReactNode;
    fallback?: ComponentType | undefined;
    skeletonType?: 'product-grid' | 'product-detail' | 'order-list' | 'profile' | undefined;
}

export function LazyScreen({
    children,
    fallback,
    skeletonType = 'product-grid'
}: LazyScreenProps) {
    const FallbackComponent = fallback || (() => (
        <View style={styles.fallbackContainer}>
            <SkeletonScreen type={skeletonType} />
        </View>
    ));

    return (
        <Suspense fallback={<FallbackComponent />}>
            {children}
        </Suspense>
    );
}

// HOC for lazy loading screens
export function withLazyLoading<P extends object>(
    importFunction: () => Promise<{ default: ComponentType<P> }>,
    fallbackComponent?: ComponentType | undefined,
    skeletonType?: 'product-grid' | 'product-detail' | 'order-list' | 'profile' | undefined
): ComponentType<P> {
    const LazyComponent = createLazyComponent(importFunction);

    return (props: P) => (
        <LazyScreen
            fallback={fallbackComponent}
            skeletonType={skeletonType}
        >
            <LazyComponent {...props} />
        </LazyScreen>
    );
}

// Prebuilt lazy screen components
export const LazyUserHome = withLazyLoading(
    () => import('../../app/(user)/index'),
    undefined,
    'product-grid'
);

export const LazyProductDetail = withLazyLoading(
    () => import('../../app/(user)/product/[id]'),
    undefined,
    'product-detail'
);

export const LazyCart = withLazyLoading(
    () => import('../../app/(user)/cart'),
    undefined,
    'order-list'
);

export const LazyCheckout = withLazyLoading(
    () => import('../../app/(user)/checkout'),
    undefined,
    'order-list'
);

export const LazyProfile = withLazyLoading(
    () => import('../../app/(user)/profile'),
    undefined,
    'profile'
);

export const LazyOrderHistory = withLazyLoading(
    () => import('../../app/(user)/order-history'),
    undefined,
    'order-list'
);

export const LazyAdminDashboard = withLazyLoading(
    () => import('../../app/(admin)/index'),
    undefined,
    'product-grid'
);

export const LazyAdminProducts = withLazyLoading(
    () => import('../../app/(admin)/products'),
    undefined,
    'product-grid'
);

export const LazyAdminOrders = withLazyLoading(
    () => import('../../app/(admin)/orders'),
    undefined,
    'order-list'
);

export const LazyAdminUsers = withLazyLoading(
    () => import('../../app/(admin)/users'),
    undefined,
    'profile'
);

const styles = StyleSheet.create({
    fallbackContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
});