import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types';

interface AdminProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
    onToggleStatus: (productId: string) => void;
    isSelected?: boolean;
    onSelect?: (productId: string) => void;
}

export const AdminProductCard: React.FC<AdminProductCardProps> = ({
    product,
    onEdit,
    onDelete,
    onToggleStatus,
    isSelected = false,
    onSelect
}) => {
    const handleDelete = () => {
        Alert.alert(
            'Delete Product',
            `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: () => onDelete(product.id)
                }
            ]
        );
    };

    const handleToggleStatus = () => {
        const action = product.isActive ? 'deactivate' : 'activate';
        Alert.alert(
            `${action.charAt(0).toUpperCase() + action.slice(1)} Product`,
            `Are you sure you want to ${action} "${product.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: action.charAt(0).toUpperCase() + action.slice(1), 
                    onPress: () => onToggleStatus(product.id)
                }
            ]
        );
    };

    const totalStock = product.inventory.reduce((sum, item) => sum + item.quantity, 0);
    const isLowStock = totalStock < 10;

    return (
        <View style={[styles.card, isSelected && styles.selectedCard]}>
            {onSelect && (
                <TouchableOpacity 
                    style={styles.selectButton}
                    onPress={() => onSelect(product.id)}
                >
                    <Ionicons 
                        name={isSelected ? 'checkbox' : 'square-outline'} 
                        size={20} 
                        color={isSelected ? '#000000' : '#666666'} 
                    />
                </TouchableOpacity>
            )}
            
            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: product.images[0] || 'https://via.placeholder.com/100' }}
                    style={styles.productImage}
                    resizeMode="cover"
                />
                {!product.isActive && (
                    <View style={styles.inactiveOverlay}>
                        <Text style={styles.inactiveText}>Inactive</Text>
                    </View>
                )}
            </View>

            <View style={styles.productInfo}>
                <View style={styles.header}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                    </Text>
                    <View style={styles.statusContainer}>
                        {isLowStock && (
                            <View style={styles.lowStockBadge}>
                                <Text style={styles.lowStockText}>Low Stock</Text>
                            </View>
                        )}
                        <View style={[
                            styles.statusBadge, 
                            product.isActive ? styles.activeBadge : styles.inactiveBadge
                        ]}>
                            <Text style={[
                                styles.statusText,
                                product.isActive ? styles.activeText : styles.inactiveStatusText
                            ]}>
                                {product.isActive ? 'Active' : 'Inactive'}
                            </Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.category}>{product.category.name}</Text>
                <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                <Text style={styles.stock}>Stock: {totalStock} units</Text>

                <View style={styles.variantInfo}>
                    <Text style={styles.variantText}>
                        {product.sizes.length} sizes • {product.colors.length} colors
                    </Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => onEdit(product)}
                    >
                        <Ionicons name="create-outline" size={16} color="#000000" />
                        <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={handleToggleStatus}
                    >
                        <Ionicons 
                            name={product.isActive ? 'pause-outline' : 'play-outline'} 
                            size={16} 
                            color="#666666" 
                        />
                        <Text style={styles.actionText}>
                            {product.isActive ? 'Deactivate' : 'Activate'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={handleDelete}
                    >
                        <Ionicons name="trash-outline" size={16} color="#D32F2F" />
                        <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
        flexDirection: 'row',
    },
    selectedCard: {
        borderWidth: 2,
        borderColor: '#000000',
    },
    selectButton: {
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 1,
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 16,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    inactiveOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inactiveText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    productInfo: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
        flex: 1,
        marginRight: 8,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    lowStockBadge: {
        backgroundColor: '#FFF3CD',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 4,
    },
    lowStockText: {
        fontSize: 10,
        color: '#856404',
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeBadge: {
        backgroundColor: '#E8F5E8',
    },
    inactiveBadge: {
        backgroundColor: '#F5F5F5',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    activeText: {
        color: '#4A5D23',
    },
    inactiveStatusText: {
        color: '#666666',
    },
    category: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Inter',
        marginBottom: 4,
    },
    price: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
        marginBottom: 4,
    },
    stock: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Inter',
        marginBottom: 8,
    },
    variantInfo: {
        marginBottom: 12,
    },
    variantText: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Inter',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    actionText: {
        fontSize: 12,
        color: '#000000',
        fontFamily: 'Inter',
        marginLeft: 4,
    },
    deleteButton: {
        // No additional styles needed
    },
    deleteText: {
        color: '#D32F2F',
    },
});