import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaWrapper } from '../../components/shared/SafeAreaWrapper';
import { ProductGrid } from '../../components/ui/ProductGrid';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import productService from '../../services/productService';
import { Product } from '../../types';
import { router } from 'expo-router';

export default function UserHome() {
  const {
    products,
    categories,
    searchQuery,
    selectedCategory,
    isLoading,
    error,
    setProducts,
    setCategories,
    setSelectedCategory,
    setLoading,
    setError,
    getFilteredProducts,
  } = useProductStore();

  const { addToCart, getCartItemCount } = useCartStore();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load products, categories, and featured products in parallel
      const [productsResponse, categoriesData, featuredData] = await Promise.all([
        productService.getProducts({ limit: 50 }),
        productService.getCategories(),
        productService.getFeaturedProducts(8),
      ]);

      setProducts(productsResponse.products);
      setCategories(categoriesData);
      setFeaturedProducts(featuredData);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadInitialData();
    setIsRefreshing(false);
  }, []);



  const handleCategoryPress = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, [setSelectedCategory]);

  const handleProductPress = useCallback((product: Product) => {
    router.push(`/product/${product.id}`);
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    // For quick add to cart from home, use first available size and color
    const firstSize = product.sizes[0];
    const firstColor = product.colors[0];
    
    if (!firstSize || !firstColor) {
      Alert.alert('Selection Required', 'Please select size and color from product details.');
      handleProductPress(product);
      return;
    }

    // Check if this combination has inventory
    const inventoryItem = product.inventory.find(
      item => item.sizeId === firstSize.id && item.colorId === firstColor.id
    );

    if (!inventoryItem || inventoryItem.quantity === 0) {
      Alert.alert('Out of Stock', 'This product is currently out of stock.');
      return;
    }

    addToCart(product, firstSize.id, firstColor.id, 1);
    Alert.alert('Added to Cart', `${product.name} has been added to your cart.`);
  }, [addToCart, handleProductPress]);

  const filteredProducts = getFilteredProducts();

  if (isLoading && products.length === 0) {
    return (
      <SafeAreaWrapper>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#000000']}
            tintColor="#000000"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Discover</Text>
            <Text style={styles.subtitleText}>Fashion that speaks to you</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/(user)/profile')}
            >
              <Ionicons name="person-outline" size={24} color="#333333" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => router.push('/(user)/cart')}
            >
              <Ionicons name="bag-outline" size={24} color="#333333" />
              {getCartItemCount() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {getCartItemCount()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search" size={20} color="#666666" />
            <Text style={styles.searchButtonText}>Search for clothing...</Text>
          </TouchableOpacity>
        </View>

        {/* Promotional Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/350x150/000000/FFFFFF?text=New+Collection' }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>New Collection</Text>
            <Text style={styles.bannerSubtitle}>Discover the latest trends</Text>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContainer}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategory && styles.categoryChipActive,
              ]}
              onPress={() => handleCategoryPress(null)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  !selectedCategory && styles.categoryChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive,
                ]}
                onPress={() => handleCategoryPress(category.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category.id && styles.categoryChipTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && !searchQuery && !selectedCategory && (
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScrollContainer}
            >
              {featuredProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.featuredCard}
                  onPress={() => handleProductPress(product)}
                >
                  <Image
                    source={{ uri: product.images[0] || 'https://via.placeholder.com/120x150' }}
                    style={styles.featuredImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.featuredName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.featuredPrice}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(product.price)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Products Grid */}
        <View style={styles.productsSection}>
          <View style={styles.productsSectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery
                ? `Search Results (${filteredProducts.length})`
                : selectedCategory
                ? `${categories.find(c => c.id === selectedCategory)?.name || 'Category'} (${filteredProducts.length})`
                : `All Products (${filteredProducts.length})`}
            </Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadInitialData}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ProductGrid
              products={filteredProducts}
              onProductPress={handleProductPress}
              onAddToCart={handleAddToCart}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              emptyMessage={
                searchQuery
                  ? `No products found for "${searchQuery}"`
                  : selectedCategory
                  ? 'No products in this category'
                  : 'No products available'
              }
              contentContainerStyle={styles.productGridContainer}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Inter',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    padding: 8,
    marginTop: 4,
    marginRight: 8,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
    marginTop: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Poppins',
  },
  subtitleText: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Inter',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  searchButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#999999',
    fontFamily: 'Inter',
    marginLeft: 12,
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F5F5F5',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginTop: 4,
  },
  categorySection: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Poppins',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryScrollContainer: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  featuredSection: {
    marginVertical: 16,
  },
  featuredScrollContainer: {
    paddingHorizontal: 16,
  },
  featuredCard: {
    width: 120,
    marginRight: 12,
  },
  featuredImage: {
    width: 120,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  featuredName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    fontFamily: 'Inter',
    marginTop: 8,
    lineHeight: 16,
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Poppins',
    marginTop: 4,
  },
  productsSection: {
    flex: 1,
    marginTop: 16,
  },
  productsSectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  productGridContainer: {
    paddingBottom: 32,
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontWeight: '600',
  },
});
