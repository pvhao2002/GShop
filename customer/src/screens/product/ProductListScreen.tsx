import React, { useState, useEffect, useCallback } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Spinner,
  Center,
  useToast,
  IconButton,
  Modal,
  Select,
  CheckIcon,
} from 'native-base';
import { RefreshControl, Dimensions, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store';
import {
  setProductsPagination,
  setCategories,
  setSearchQuery,
  setSelectedCategory,
  setLoading,
  setLoadingMore,
  setError,
  clearProducts,
} from '../../store/slices/productSlice';
import productService, { ProductSearchParams } from '../../services/productService';
import {
  ProductCard,
  SearchBar,
  CategoryFilter,
} from '../../components/product';
import { ThemedSafeAreaView } from '../../components/common';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_WIDTH = (screenWidth - 48) / 2; // 2 columns with padding

const ProductListScreen: React.FC = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  
  const {
    products,
    categories,
    searchQuery,
    selectedCategory,
    currentPage,
    hasNextPage,
    isLoading,
    isLoadingMore,
    error,
  } = useSelector((state: RootState) => state.product);

  const [refreshing, setRefreshing] = useState(false);
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useFocusEffect(
    useCallback(() => {
      if (products.length === 0) {
        loadInitialData();
      }
    }, [])
  );

  useEffect(() => {
    // Reset and reload when search or category changes
    handleSearch();
  }, [searchQuery, selectedCategory, sortBy, sortDirection]);

  const loadInitialData = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const [productsResponse, categoriesData] = await Promise.all([
        productService.getProducts({
          page: 0,
          size: 20,
          sortBy,
          sortDirection,
        }),
        productService.getCategories(),
      ]);

      dispatch(setProductsPagination({
        products: productsResponse.content,
        currentPage: productsResponse.currentPage,
        totalPages: productsResponse.totalPages,
        hasNextPage: productsResponse.hasNext,
      }));

      dispatch(setCategories(categoriesData));
    } catch (error) {
      console.error('Error loading initial data:', error);
      dispatch(setError('Failed to load products'));
      toast.show({
        title: 'Error',
        description: 'Failed to load products',
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearch = async () => {
    try {
      dispatch(clearProducts());
      dispatch(setLoading(true));
      dispatch(setError(null));

      const params: ProductSearchParams = {
        page: 0,
        size: 20,
        sortBy,
        sortDirection,
      };

      let response;
      if (searchQuery.trim()) {
        response = await productService.searchProducts(searchQuery.trim(), params);
      } else if (selectedCategory) {
        response = await productService.getProductsByCategory(selectedCategory, params);
      } else {
        response = await productService.getProducts(params);
      }

      dispatch(setProductsPagination({
        products: response.content,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        hasNextPage: response.hasNext,
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      dispatch(setError('Failed to search products'));
      toast.show({
        title: 'Error',
        description: 'Failed to search products',
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLoadMore = async () => {
    if (!hasNextPage || isLoadingMore) return;

    try {
      dispatch(setLoadingMore(true));

      const params: ProductSearchParams = {
        page: currentPage + 1,
        size: 20,
        sortBy,
        sortDirection,
      };

      let response;
      if (searchQuery.trim()) {
        response = await productService.searchProducts(searchQuery.trim(), params);
      } else if (selectedCategory) {
        response = await productService.getProductsByCategory(selectedCategory, params);
      } else {
        response = await productService.getProducts(params);
      }

      dispatch(setProductsPagination({
        products: response.content,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        hasNextPage: response.hasNext,
        append: true,
      }));
    } catch (error) {
      console.error('Error loading more products:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to load more products',
      });
    } finally {
      dispatch(setLoadingMore(false));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleSearchQueryChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleCategorySelect = (categoryId: string | null) => {
    dispatch(setSelectedCategory(categoryId));
  };

  const renderProductItem = ({ item, index }: { item: any; index: number }) => (
    <Box width={ITEM_WIDTH} mb={4}>
      <ProductCard product={item} />
    </Box>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <Center py={4}>
        <Spinner size="sm" />
        <Text mt={2} fontSize="sm" color="gray.500">
          Loading more products...
        </Text>
      </Center>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <Center flex={1} py={20}>
        <Ionicons name="search" size={64} color="#ccc" />
        <Text fontSize="lg" color="gray.500" mt={4}>
          {searchQuery || selectedCategory ? 'No products found' : 'No products available'}
        </Text>
        {(searchQuery || selectedCategory) && (
          <Button
            variant="ghost"
            mt={4}
            onPress={() => {
              dispatch(setSearchQuery(''));
              dispatch(setSelectedCategory(null));
            }}
          >
            Clear Filters
          </Button>
        )}
      </Center>
    );
  };

  if (isLoading && products.length === 0) {
    return (
      <ThemedSafeAreaView>
        <Center flex={1}>
          <Spinner size="lg" />
          <Text mt={2}>Loading products...</Text>
        </Center>
      </ThemedSafeAreaView>
    );
  }

  return (
    <ThemedSafeAreaView>
      <VStack flex={1}>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center" px={4} py={2}>
          <Text fontSize="xl" fontWeight="bold">
            Products
          </Text>
          <IconButton
            icon={<Ionicons name="options" size={20} />}
            onPress={() => setSortModalOpen(true)}
            bg="gray.100"
            rounded="md"
            size="sm"
          />
        </HStack>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchQueryChange}
          onSearch={handleSearch}
        />

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />

        {/* Products List */}
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 20,
          }}
          columnWrapperStyle={{
            justifyContent: 'space-between',
          }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
        />

        {/* Sort Modal */}
        <Modal isOpen={sortModalOpen} onClose={() => setSortModalOpen(false)}>
          <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
            <Modal.Header>Sort Products</Modal.Header>
            <Modal.Body>
              <VStack space={4}>
                <VStack space={2}>
                  <Text fontWeight="semibold">Sort By</Text>
                  <Select
                    selectedValue={sortBy}
                    onValueChange={(value) => setSortBy(value as any)}
                    _selectedItem={{
                      bg: 'primary.100',
                      endIcon: <CheckIcon size="5" />,
                    }}
                  >
                    <Select.Item label="Name" value="name" />
                    <Select.Item label="Price" value="price" />
                    <Select.Item label="Newest" value="createdAt" />
                  </Select>
                </VStack>

                <VStack space={2}>
                  <Text fontWeight="semibold">Order</Text>
                  <Select
                    selectedValue={sortDirection}
                    onValueChange={(value) => setSortDirection(value as any)}
                    _selectedItem={{
                      bg: 'primary.100',
                      endIcon: <CheckIcon size="5" />,
                    }}
                  >
                    <Select.Item label="Ascending" value="asc" />
                    <Select.Item label="Descending" value="desc" />
                  </Select>
                </VStack>
              </VStack>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button
                  variant="ghost"
                  colorScheme="blueGray"
                  onPress={() => setSortModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onPress={() => setSortModalOpen(false)}>
                  Apply
                </Button>
              </Button.Group>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </VStack>
    </ThemedSafeAreaView>
  );
};

export default ProductListScreen;