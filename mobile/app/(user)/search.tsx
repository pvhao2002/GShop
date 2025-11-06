import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaWrapper } from '../../components/shared/SafeAreaWrapper';
import { SearchBar } from '../../components/ui/SearchBar';
import { ProductGrid } from '../../components/ui/ProductGrid';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import productService from '../../services/productService';
import { Product } from '../../types';

interface FilterOptions {
  categories: string[];
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: 'name' | 'price' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export default function SearchScreen() {
  const {
    categories,
    searchQuery,
    setSearchQuery,
    setCategories,
    isLoading,
    setLoading,
    error,
    setError,
  } = useProductStore();

  const { addToCart } = useCartStore();

  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    minPrice: null,
    maxPrice: null,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [searchQuery, filters]);

  const loadCategories = async () => {
    try {
      const categoriesData = await productService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const searchParams = {
        query: searchQuery,
        ...(filters.categories.length > 0 && { categoryId: filters.categories[0] }), // API might support only one category
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        limit: 50,
      };

      const response = await productService.searchProducts(searchQuery, searchParams);
      setSearchResults(response.products);
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Failed to search products. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  }, [setSearchQuery]);

  const handleProductPress = useCallback((product: Product) => {
    router.push(`/(user)/product/${product.id}`);
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    // For quick add to cart from search, use first available size and color
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

  const handleShowFilters = () => {
    setTempFilters(filters);
    setShowFilters(true);
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const resetFilters: FilterOptions = {
      categories: [],
      minPrice: null,
      maxPrice: null,
      sortBy: 'name',
      sortOrder: 'asc',
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setShowFilters(false);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setTempFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy'], sortOrder: FilterOptions['sortOrder']) => {
    setTempFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder,
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.minPrice !== null || filters.maxPrice !== null) count++;
    if (filters.sortBy !== 'name' || filters.sortOrder !== 'asc') count++;
    return count;
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaWrapper>
        <View style={styles.filterModal}>
          {/* Filter Header */}
          <View style={styles.filterHeader}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.filterCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.filterTitle}>Filters</Text>
            <TouchableOpacity onPress={handleResetFilters}>
              <Text style={styles.filterResetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {/* Categories */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Categories</Text>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.filterOption}
                  onPress={() => handleCategoryToggle(category.id)}
                >
                  <Text style={styles.filterOptionText}>{category.name}</Text>
                  <View style={[
                    styles.checkbox,
                    tempFilters.categories.includes(category.id) && styles.checkboxActive,
                  ]}>
                    {tempFilters.categories.includes(category.id) && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              
              <TouchableOpacity
                style={styles.filterOption}
                onPress={() => handleSortChange('name', 'asc')}
              >
                <Text style={styles.filterOptionText}>Name (A-Z)</Text>
                <View style={[
                  styles.radio,
                  tempFilters.sortBy === 'name' && tempFilters.sortOrder === 'asc' && styles.radioActive,
                ]} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterOption}
                onPress={() => handleSortChange('name', 'desc')}
              >
                <Text style={styles.filterOptionText}>Name (Z-A)</Text>
                <View style={[
                  styles.radio,
                  tempFilters.sortBy === 'name' && tempFilters.sortOrder === 'desc' && styles.radioActive,
                ]} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterOption}
                onPress={() => handleSortChange('price', 'asc')}
              >
                <Text style={styles.filterOptionText}>Price (Low to High)</Text>
                <View style={[
                  styles.radio,
                  tempFilters.sortBy === 'price' && tempFilters.sortOrder === 'asc' && styles.radioActive,
                ]} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterOption}
                onPress={() => handleSortChange('price', 'desc')}
              >
                <Text style={styles.filterOptionText}>Price (High to Low)</Text>
                <View style={[
                  styles.radio,
                  tempFilters.sortBy === 'price' && tempFilters.sortOrder === 'desc' && styles.radioActive,
                ]} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterOption}
                onPress={() => handleSortChange('createdAt', 'desc')}
              >
                <Text style={styles.filterOptionText}>Newest First</Text>
                <View style={[
                  styles.radio,
                  tempFilters.sortBy === 'createdAt' && tempFilters.sortOrder === 'desc' && styles.radioActive,
                ]} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.filterFooter}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaWrapper>
    </Modal>
  );

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            onClear={handleClearSearch}
            placeholder="Search for clothing..."
            autoFocus={true}
          />
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity style={styles.filterButton} onPress={handleShowFilters}>
            <Ionicons name="options-outline" size={20} color="#000000" />
            <Text style={styles.filterButtonText}>Filters</Text>
            {getActiveFiltersCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
              </View>
            )}
          </TouchableOpacity>

          {hasSearched && (
            <Text style={styles.resultsCount}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner size="large" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={performSearch}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : !hasSearched ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={64} color="#E8E8E8" />
              <Text style={styles.emptyTitle}>Search for Products</Text>
              <Text style={styles.emptySubtitle}>
                Enter a product name or keyword to find what you're looking for
              </Text>
            </View>
          ) : (
            <ProductGrid
              products={searchResults}
              onProductPress={handleProductPress}
              onAddToCart={handleAddToCart}
              emptyMessage={`No products found for "${searchQuery}"`}
              contentContainerStyle={styles.productGridContainer}
            />
          )}
        </View>

        {renderFilterModal()}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Poppins',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'relative',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Inter',
    fontWeight: '500',
    marginLeft: 8,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Inter',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'Poppins',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 20,
  },
  productGridContainer: {
    paddingBottom: 32,
  },
  // Filter Modal Styles
  filterModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  filterCancelText: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Inter',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Poppins',
  },
  filterResetText: {
    fontSize: 16,
    color: '#D32F2F',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  filterContent: {
    flex: 1,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Poppins',
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Inter',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  radioActive: {
    borderColor: '#000000',
    backgroundColor: '#000000',
  },
  filterFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  applyButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
  },
});