import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Text,
} from 'react-native';
import { ProductCard } from './ProductCard';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Product } from '../../types';

interface ProductGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onRefresh?: () => void;
  onEndReached?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  numColumns?: number;
  showAddToCart?: boolean;
  emptyMessage?: string;
  contentContainerStyle?: any;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductPress,
  onAddToCart,
  onRefresh,
  onEndReached,
  isLoading = false,
  isRefreshing = false,
  numColumns = 2,
  showAddToCart = true,
  emptyMessage = 'No products found',
  contentContainerStyle,
}) => {
  const { width: screenWidth } = Dimensions.get('window');
  const cardWidth = (screenWidth - 24 - (numColumns - 1) * 12) / numColumns;

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={onProductPress}
      {...(onAddToCart && { onAddToCart })}
      showAddToCart={showAddToCart}
      cardWidth={cardWidth}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <LoadingSpinner size="small" />
      </View>
    );
  };

  const keyExtractor = (item: Product) => item.id;

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        contentContainerStyle={[
          styles.contentContainer,
          contentContainerStyle,
          products.length === 0 && styles.emptyContentContainer,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['#000000']}
              tintColor="#000000"
            />
          ) : undefined
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={6}
        getItemLayout={(_data, index) => ({
          length: cardWidth * (4/5) + 60, // Approximate item height
          offset: (cardWidth * (4/5) + 60) * Math.floor(index / numColumns),
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 12,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});