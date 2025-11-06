import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, DimensionValue } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface SkeletonItemProps {
    width: DimensionValue;
    height: number;
    borderRadius?: number;
    marginBottom?: number;
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({
    width,
    height,
    borderRadius = 4,
    marginBottom = 8,
}) => {
    const shimmer = useSharedValue(0);

    useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 1000 }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(shimmer.value, [0, 1], [0.3, 0.7]);
        return {
            opacity,
        };
    });

    return (
        <View
            style={[
                styles.skeletonItem,
                {
                    width,
                    height,
                    borderRadius,
                    marginBottom,
                },
            ]}
        >
            <Animated.View
                style={[
                    StyleSheet.absoluteFillObject,
                    styles.skeletonItem,
                    animatedStyle,
                ]}
            />
        </View>
    );
};

interface SkeletonScreenProps {
    type: 'product-grid' | 'product-detail' | 'order-list' | 'profile';
}

export const SkeletonScreen: React.FC<SkeletonScreenProps> = ({ type }) => {
    const renderProductGrid = () => (
        <View style={styles.container}>
            <SkeletonItem width="60%" height={24} marginBottom={16} />
            <View style={styles.gridContainer}>
                {Array.from({ length: 6 }).map((_, index) => (
                    <View key={index} style={styles.gridItem}>
                        <SkeletonItem width="100%" height={120} borderRadius={8} />
                        <SkeletonItem width="80%" height={16} marginBottom={4} />
                        <SkeletonItem width="60%" height={14} />
                    </View>
                ))}
            </View>
        </View>
    );

    const renderProductDetail = () => (
        <View style={styles.container}>
            <SkeletonItem width="100%" height={300} borderRadius={8} marginBottom={16} />
            <SkeletonItem width="90%" height={24} marginBottom={8} />
            <SkeletonItem width="40%" height={20} marginBottom={16} />
            <SkeletonItem width="100%" height={16} marginBottom={4} />
            <SkeletonItem width="100%" height={16} marginBottom={4} />
            <SkeletonItem width="70%" height={16} marginBottom={16} />
            <SkeletonItem width="100%" height={48} borderRadius={8} />
        </View>
    );

    const renderOrderList = () => (
        <View style={styles.container}>
            <SkeletonItem width="50%" height={24} marginBottom={16} />
            {Array.from({ length: 4 }).map((_, index) => (
                <View key={index} style={styles.orderItem}>
                    <SkeletonItem width="70%" height={18} marginBottom={8} />
                    <SkeletonItem width="50%" height={16} marginBottom={4} />
                    <SkeletonItem width="30%" height={14} />
                </View>
            ))}
        </View>
    );

    const renderProfile = () => (
        <View style={styles.container}>
            <View style={styles.profileHeader}>
                <SkeletonItem width={80} height={80} borderRadius={40} marginBottom={16} />
                <SkeletonItem width="60%" height={20} marginBottom={8} />
                <SkeletonItem width="80%" height={16} />
            </View>
            <View style={styles.profileContent}>
                {Array.from({ length: 5 }).map((_, index) => (
                    <View key={index} style={styles.profileItem}>
                        <SkeletonItem width="30%" height={16} marginBottom={4} />
                        <SkeletonItem width="70%" height={18} />
                    </View>
                ))}
            </View>
        </View>
    );

    const renderSkeleton = () => {
        switch (type) {
            case 'product-grid':
                return renderProductGrid();
            case 'product-detail':
                return renderProductDetail();
            case 'order-list':
                return renderOrderList();
            case 'profile':
                return renderProfile();
            default:
                return renderProductGrid();
        }
    };

    return renderSkeleton();
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    skeletonItem: {
        backgroundColor: '#E8E8E8',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: (width - 48) / 2,
        marginBottom: 16,
    },
    orderItem: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        marginBottom: 12,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    profileContent: {
        flex: 1,
    },
    profileItem: {
        marginBottom: 24,
    },
});