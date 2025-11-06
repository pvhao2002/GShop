import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaWrapper } from '../../../components/shared/SafeAreaWrapper';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { useProductStore } from '../../../store/productStore';
import { useCartStore } from '../../../store/cartStore';
import productService from '../../../services/productService';
import { Product, Size, Color } from '../../../types';

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProductById, setCurrentProduct, currentProduct } = useProductStore();
  const { addToCart } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (id) {
      loadProductDetail(id);
    }
  }, [id]);

  const loadProductDetail = async (productId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // First check if product is already in store
      const existingProduct = getProductById(productId);
      if (existingProduct) {
        setProduct(existingProduct);
        setCurrentProduct(existingProduct);
        // Set default selections
        if (existingProduct.sizes.length > 0) setSelectedSize(existingProduct.sizes[0]);
        if (existingProduct.colors.length > 0) setSelectedColor(existingProduct.colors[0]);
      }

      // Fetch fresh data from API
      const [productData, relatedData] = await Promise.all([
        productService.getProductById(productId),
        productService.getRelatedProducts(productId, 6),
      ]);

      setProduct(productData);
      setCurrentProduct(productData);
      setRelatedProducts(relatedData);

      // Set default selections if not already set
      if (!selectedSize && productData.sizes.length > 0) {
        setSelectedSize(productData.sizes[0]);
      }
      if (!selectedColor && productData.colors.length > 0) {
        setSelectedColor(productData.colors[0]);
      }
    } catch (err) {
      console.error('Error loading product detail:', err);
      setError('Failed to load product details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePress = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const handleSizeSelect = useCallback((size: Size) => {
    setSelectedSize(size);
  }, []);

  const handleColorSelect = useCallback((color: Color) => {
    setSelectedColor(color);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!product || !selectedSize || !selectedColor) {
      Alert.alert('Selection Required', 'Please select both size and color.');
      return;
    }

    // Check inventory for selected combination
    const inventoryItem = product.inventory.find(
      item => item.sizeId === selectedSize.id && item.colorId === selectedColor.id
    );

    if (!inventoryItem || inventoryItem.quantity === 0) {
      Alert.alert('Out of Stock', 'This combination is currently out of stock.');
      return;
    }

    addToCart(product, selectedSize.id, selectedColor.id, 1);
    Alert.alert(
      'Added to Cart',
      `${product.name} (${selectedSize.name}, ${selectedColor.name}) has been added to your cart.`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/(user)/cart') },
      ]
    );
  }, [product, selectedSize, selectedColor, addToCart]);

  const handleShare = useCallback(async () => {
    if (!product) return;

    try {
      await Share.share({
        message: `Check out this ${product.name} - ${product.description}`,
        url: `https://yourapp.com/product/${product.id}`,
      });
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  }, [product]);

  const handleRelatedProductPress = useCallback((relatedProduct: Product) => {
    router.push(`/(user)/product/${relatedProduct.id}`);
  }, []);

  const getAvailableQuantity = useCallback(() => {
    if (!product || !selectedSize || !selectedColor) return 0;
    
    const inventoryItem = product.inventory.find(
      item => item.sizeId === selectedSize.id && item.colorId === selectedColor.id
    );
    
    return inventoryItem?.quantity || 0;
  }, [product, selectedSize, selectedColor]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (isLoading) {
    return (
      <SafeAreaWrapper>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaWrapper>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Product not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => id && loadProductDetail(id)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaWrapper>
    );
  }

  const availableQuantity = getAvailableQuantity();
  const isOutOfStock = availableQuantity === 0;

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Image Gallery */}
          <View style={styles.imageSection}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                setSelectedImageIndex(index);
              }}
            >
              {product.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.imageContainer}
                  onPress={() => handleImagePress(index)}
                >
                  <Image
                    source={{ uri: image || 'https://via.placeholder.com/400x500' }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Image Indicators */}
            {product.images.length > 1 && (
              <View style={styles.imageIndicators}>
                {product.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === selectedImageIndex && styles.activeIndicator,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text style={styles.categoryText}>{product.category.name}</Text>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
            
            {/* Stock Status */}
            <View style={styles.stockContainer}>
              <View style={[
                styles.stockIndicator,
                isOutOfStock ? styles.outOfStockIndicator : styles.inStockIndicator,
              ]} />
              <Text style={[
                styles.stockText,
                isOutOfStock ? styles.outOfStockText : styles.inStockText,
              ]}>
                {isOutOfStock ? 'Out of Stock' : `${availableQuantity} in stock`}
              </Text>
            </View>

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <View style={styles.selectionSection}>
                <Text style={styles.selectionTitle}>Size</Text>
                <View style={styles.sizeContainer}>
                  {product.sizes.map((size) => (
                    <TouchableOpacity
                      key={size.id}
                      style={[
                        styles.sizeOption,
                        selectedSize?.id === size.id && styles.selectedSizeOption,
                      ]}
                      onPress={() => handleSizeSelect(size)}
                    >
                      <Text
                        style={[
                          styles.sizeText,
                          selectedSize?.id === size.id && styles.selectedSizeText,
                        ]}
                      >
                        {size.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <View style={styles.selectionSection}>
                <Text style={styles.selectionTitle}>Color</Text>
                <View style={styles.colorContainer}>
                  {product.colors.map((color) => (
                    <TouchableOpacity
                      key={color.id}
                      style={[
                        styles.colorOption,
                        selectedColor?.id === color.id && styles.selectedColorOption,
                      ]}
                      onPress={() => handleColorSelect(color)}
                    >
                      <View
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: color.hexCode },
                        ]}
                      />
                      <Text style={styles.colorName}>{color.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <View style={styles.relatedSection}>
                <Text style={styles.relatedTitle}>You might also like</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.relatedScrollContainer}
                >
                  {relatedProducts.map((relatedProduct) => (
                    <TouchableOpacity
                      key={relatedProduct.id}
                      style={styles.relatedCard}
                      onPress={() => handleRelatedProductPress(relatedProduct)}
                    >
                      <Image
                        source={{ uri: relatedProduct.images[0] || 'https://via.placeholder.com/100x125' }}
                        style={styles.relatedImage}
                        resizeMode="cover"
                      />
                      <Text style={styles.relatedName} numberOfLines={2}>
                        {relatedProduct.name}
                      </Text>
                      <Text style={styles.relatedPrice}>
                        {formatPrice(relatedProduct.price)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add to Cart Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              isOutOfStock && styles.disabledButton,
            ]}
            onPress={handleAddToCart}
            disabled={isOutOfStock}
          >
            <Text style={[
              styles.addToCartText,
              isOutOfStock && styles.disabledButtonText,
            ]}>
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
  },
  imageContainer: {
    width: screenWidth,
  },
  productImage: {
    width: screenWidth,
    height: screenWidth * 1.25,
    backgroundColor: '#F5F5F5',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
  },
  productInfo: {
    padding: 16,
  },
  categoryText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Poppins',
    marginBottom: 8,
    lineHeight: 32,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Poppins',
    marginBottom: 16,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  inStockIndicator: {
    backgroundColor: '#4A5D23',
  },
  outOfStockIndicator: {
    backgroundColor: '#D32F2F',
  },
  stockText: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  inStockText: {
    color: '#4A5D23',
  },
  outOfStockText: {
    color: '#D32F2F',
  },
  selectionSection: {
    marginBottom: 24,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Poppins',
    marginBottom: 12,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeOption: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    marginBottom: 8,
    minWidth: 48,
    alignItems: 'center',
  },
  selectedSizeOption: {
    borderColor: '#000000',
    backgroundColor: '#000000',
  },
  sizeText: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  selectedSizeText: {
    color: '#FFFFFF',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    marginBottom: 8,
  },
  selectedColorOption: {
    borderColor: '#000000',
  },
  colorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  colorName: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Poppins',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
    lineHeight: 20,
  },
  relatedSection: {
    marginBottom: 24,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Poppins',
    marginBottom: 12,
  },
  relatedScrollContainer: {
    paddingRight: 16,
  },
  relatedCard: {
    width: 100,
    marginRight: 12,
  },
  relatedImage: {
    width: 100,
    height: 125,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  relatedName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    fontFamily: 'Inter',
    marginTop: 8,
    lineHeight: 16,
  },
  relatedPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Poppins',
    marginTop: 4,
  },
  bottomSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
  },
  addToCartButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E8E8E8',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
  },
  disabledButtonText: {
    color: '#999999',
  },
});