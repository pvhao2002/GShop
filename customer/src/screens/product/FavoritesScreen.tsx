import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Center,
  IconButton,
} from 'native-base';
import { Dimensions, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store';
import { setProducts, setLoading, setError } from '../../store/slices/productSlice';
import productService, { Product } from '../../services/productService';
import { ProductCard } from '../../components/product';
import { ThemedSafeAreaView } from '../../components/common';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_WIDTH = (screenWidth - 48) / 2; // 2 columns with padding

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { favorites, isLoading } = useSelector((state: RootState) => state.product);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadFavoriteProducts();
  }, [favorites]);

  const loadFavoriteProducts = async () => {
    if (favorites.length === 0) {
      setFavoriteProducts([]);
      return;
    }

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // Load favorite products by their IDs
      const productPromises = favorites.map(id => productService.getProductById(id));
      const products = await Promise.all(productPromises);
      
      setFavoriteProducts(products.filter(Boolean)); // Filter out any null/undefined products
    } catch (error) {
      console.error('Error loading favorite products:', error);
      dispatch(setError('Failed to load favorite products'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <Box width={ITEM_WIDTH} mb={4}>
      <ProductCard product={item} />
    </Box>
  );

  const renderEmpty = () => (
    <Center flex={1} py={20}>
      <Ionicons name="heart-outline" size={64} color="#ccc" />
      <Text fontSize="lg" color="gray.500" mt={4} textAlign="center">
        No favorite products yet
      </Text>
      <Text fontSize="sm" color="gray.400" mt={2} textAlign="center" px={8}>
        Start adding products to your favorites by tapping the heart icon
      </Text>
      <Button
        variant="ghost"
        mt={6}
        onPress={() => navigation.navigate('Products' as never)}
        leftIcon={<Ionicons name="search" size={16} color="#666" />}
      >
        Browse Products
      </Button>
    </Center>
  );

  return (
    <ThemedSafeAreaView>
      <VStack flex={1}>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center" px={4} py={3}>
          <Text fontSize="xl" fontWeight="bold">
            My Favorites
          </Text>
          <Text fontSize="sm" color="gray.500">
            {favoriteProducts.length} {favoriteProducts.length === 1 ? 'item' : 'items'}
          </Text>
        </HStack>

        {/* Favorites List */}
        <FlatList
          data={favoriteProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 20,
            flexGrow: 1,
          }}
          columnWrapperStyle={{
            justifyContent: 'space-between',
          }}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      </VStack>
    </ThemedSafeAreaView>
  );
};

export default FavoritesScreen;