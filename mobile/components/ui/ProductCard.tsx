import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';
import { AnimatedCard } from './AnimatedCard';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  showAddToCart?: boolean;
  cardWidth?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  showAddToCart = true,
  cardWidth,
}) => {
  const { width: screenWidth } = Dimensions.get('window');
  const defaultCardWidth = (screenWidth - 48) / 2; // 2 columns with padding
  const finalCardWidth = cardWidth || defaultCardWidth;

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const isOutOfStock = product.inventory.every(item => item.quantity === 0);

  return (
    <AnimatedCard
      style={[styles.container, { width: finalCardWidth }]}
      onPress={() => onPress(product)}
      elevation={3}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images[0] || 'https://via.placeholder.com/200x250' }}
          style={styles.image}
          resizeMode="cover"
        />
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
        {showAddToCart && !isOutOfStock && (
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.categoryText}>{product.category.name}</Text>
        <Text style={styles.nameText} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.priceText}>{formatPrice(product.price)}</Text>
        
        <View style={styles.variantsContainer}>
          {product.colors.length > 0 && (
            <View style={styles.colorsContainer}>
              {product.colors.slice(0, 4).map((color) => (
                <View
                  key={color.id}
                  style={[
                    styles.colorDot,
                    { backgroundColor: color.hexCode },
                  ]}
                />
              ))}
              {product.colors.length > 4 && (
                <Text style={styles.moreColorsText}>+{product.colors.length - 4}</Text>
              )}
            </View>
          )}
          
          {product.sizes.length > 0 && (
            <Text style={styles.sizesText}>
              {product.sizes.slice(0, 3).map(size => size.name).join(', ')}
              {product.sizes.length > 3 && '...'}
            </Text>
          )}
        </View>
      </View>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: '#F5F5F5',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#000000',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Inter',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'Poppins',
    marginBottom: 4,
    lineHeight: 18,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Poppins',
    marginBottom: 8,
  },
  variantsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  moreColorsText: {
    fontSize: 10,
    color: '#666666',
    fontFamily: 'Inter',
    marginLeft: 4,
  },
  sizesText: {
    fontSize: 10,
    color: '#666666',
    fontFamily: 'Inter',
  },
});