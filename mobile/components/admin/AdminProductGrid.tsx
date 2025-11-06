import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { Product } from '@/types';
import { AdminProductCard } from './AdminProductCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface AdminProductGridProps {
    products: Product[];
    isLoading?: boolean;
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
    onToggleStatus: (productId: string) => void;
    onRefresh?: () => void;
    refreshing?: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
    selectedProducts?: string[];
    onSelectProduct?: (productId: string) => void;
    selectionMode?: boolean;
}

export const AdminProductGrid: React.FC<AdminProductGridProps> = ({
    products,
    isLoading = false,
    onEdit,
    onDelete,
    onToggleStatus,
    onRefresh,
    refreshing = false,
    onLoadMore,
    hasMore = false,
    selectedProducts = [],
    onSelectProduct,
    selectionMode = false
}) => {
    const renderProduct = ({ item }: { item: Product }) => (
        <AdminProductCard
            product={item}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            isSelected={selectionMode && selectedProducts.includes(item.id)}
            onSelect={selectionMode ? onSelectProduct : undefined}
        />
    );

    const renderFooter = () => {
        if (!hasMore) return null;
        
        return (
            <View style={styles.footer}>
                <LoadingSpinner size="small" />
                <Text style={styles.loadingText}>Loading more products...</Text>
            </View>
        );
    };

    const renderEmpty = () => {
        if (isLoading) {
            return (
                <View style={styles.emptyContainer}>
                    <LoadingSpinner />
                    <Text style={styles.emptyText}>Loading products...</Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Products Found</Text>
                <Text style={styles.emptyText}>
                    No products match your current filters. Try adjusting your search criteria.
                </Text>
            </View>
        );
    };

    if (isLoading && products.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <LoadingSpinner />
                <Text style={styles.loadingText}>Loading products...</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            onRefresh={onRefresh}
            refreshing={refreshing}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        textAlign: 'center',
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    loadingText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        marginLeft: 8,
    },
});