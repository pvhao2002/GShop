import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '../../types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, sizeId: string, colorId: string, quantity: number) => void;
  onRemove: (productId: string, sizeId: string, colorId: string) => void;
  showRemoveButton?: boolean;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  showRemoveButton = true,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const selectedSize = item.product.sizes.find(size => size.id === item.sizeId);
  const selectedColor = item.product.colors.find(color => color.id === item.colorId);
  
  const totalPrice = item.product.price * item.quantity;

  const handleQuantityDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.productId, item.sizeId, item.colorId, item.quantity - 1);
    } else {
      handleRemove();
    }
  };

  const handleQuantityIncrease = () => {
    // Check inventory availability
    const inventoryItem = item.product.inventory.find(
      inv => inv.sizeId === item.sizeId && inv.colorId === item.colorId
    );
    
    if (inventoryItem && item.quantity < inventoryItem.quantity) {
      onUpdateQuantity(item.productId, item.sizeId, item.colorId, item.quantity + 1);
    } else {
      Alert.alert('Out of Stock', 'No more items available in this size and color.');
    }
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => onRemove(item.productId, item.sizeId, item.colorId)
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: item.product.images[0] || 'https://via.placeholder.com/80x100' }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.nameText} numberOfLines={2}>
            {item.product.name}
          </Text>
          {showRemoveButton && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemove}
            >
              <Ionicons name="trash-outline" size={20} color="#D32F2F" />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.categoryText}>{item.product.category.name}</Text>
        
        <View style={styles.variantsContainer}>
          {selectedSize && (
            <View style={styles.variantChip}>
              <Text style={styles.variantText}>Size: {selectedSize.name}</Text>
            </View>
          )}
          {selectedColor && (
            <View style={styles.variantChip}>
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: selectedColor.hexCode },
                ]}
              />
              <Text style={styles.variantText}>{selectedColor.name}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.bottomContainer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleQuantityDecrease}
            >
              <Ionicons 
                name={item.quantity === 1 ? "trash-outline" : "remove"} 
                size={16} 
                color="#333333" 
              />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleQuantityIncrease}
            >
              <Ionicons name="add" size={16} color="#333333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.unitPriceText}>
              {formatPrice(item.product.price)}
            </Text>
            <Text style={styles.totalPriceText}>
              {formatPrice(totalPrice)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  nameText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'Poppins',
    lineHeight: 20,
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Inter',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  variantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  variantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  variantText: {
    fontSize: 12,
    color: '#333333',
    fontFamily: 'Inter',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'Inter',
    minWidth: 24,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  unitPriceText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Inter',
    textDecorationLine: 'line-through',
  },
  totalPriceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Poppins',
  },
});