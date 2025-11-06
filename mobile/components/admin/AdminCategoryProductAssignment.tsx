import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category, Product } from '@/types';
import { useAdminStore } from '@/store/adminStore';
import categoryService from '@/services/categoryService';

interface AdminCategoryProductAssignmentProps {
    category: Category;
    onClose: () => void;
}

export function AdminCategoryProductAssignment({ 
    category, 
    onClose 
}: AdminCategoryProductAssignmentProps) {
    const { allProducts, setLoading, setError } = useAdminStore();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadCategoryProducts();
    }, [category.id]);

    const loadCategoryProducts = async () => {
        try {
            setLoading(true);
            const products = await categoryService.getProductsByCategory(category.id);
            setCategoryProducts(products);
            setSelectedProducts(products.map(p => p.id));
        } catch (error: any) {
            setError(error.message || 'Failed to load category products');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleProductSelection = (productId: string) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        setLoading(true);
        setError(null);

        try {
            // Get currently assigned product IDs
            const currentProductIds = categoryProducts.map(p => p.id);
            
            // Find products to add and remove
            const productsToAdd = selectedProducts.filter(id => !currentProductIds.includes(id));
            const productsToRemove = currentProductIds.filter(id => !selectedProducts.includes(id));

            // Add new products to category
            if (productsToAdd.length > 0) {
                await categoryService.assignProductsToCategory(category.id, productsToAdd);
            }

            // Remove products from category
            if (productsToRemove.length > 0) {
                await categoryService.removeProductsFromCategory(category.id, productsToRemove);
            }

            Alert.alert('Success', 'Product assignments updated successfully');
            onClose();
        } catch (error: any) {
            setError(error.message || 'Failed to update product assignments');
            Alert.alert('Error', error.message || 'Failed to update product assignments');
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const renderProductItem = ({ item }: { item: Product }) => {
        const isSelected = selectedProducts.includes(item.id);
        
        return (
            <TouchableOpacity
                style={[styles.productItem, isSelected && styles.selectedProductItem]}
                onPress={() => toggleProductSelection(item.id)}
            >
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                    {item.category.name !== category.name && (
                        <Text style={styles.currentCategory}>
                            Current: {item.category.name}
                        </Text>
                    )}
                </View>
                
                <View style={[styles.checkbox, isSelected && styles.checkedCheckbox]}>
                    {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    Assign Products to "{category.name}"
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#333333" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search products..."
                    placeholderTextColor="#999999"
                />
            </View>

            <View style={styles.selectionInfo}>
                <Text style={styles.selectionText}>
                    {selectedProducts.length} of {allProducts.length} products selected
                </Text>
            </View>

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                renderItem={renderProductItem}
                style={styles.productList}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onClose}
                    disabled={isSubmitting}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.saveButton, isSubmitting && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={isSubmitting}
                >
                    <Text style={styles.saveButtonText}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        fontFamily: 'Poppins',
        flex: 1,
    },
    closeButton: {
        padding: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        margin: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'Inter',
        color: '#333333',
    },
    selectionInfo: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    selectionText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
    },
    productList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    selectedProductItem: {
        borderColor: '#000000',
        backgroundColor: '#F8F9FA',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333333',
        fontFamily: 'Inter',
    },
    productPrice: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        marginTop: 2,
    },
    currentCategory: {
        fontSize: 12,
        color: '#999999',
        fontFamily: 'Inter',
        marginTop: 2,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    checkedCheckbox: {
        backgroundColor: '#000000',
        borderColor: '#000000',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        gap: 16,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    saveButton: {
        backgroundColor: '#000000',
    },
    disabledButton: {
        backgroundColor: '#CCCCCC',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666666',
        fontFamily: 'Inter',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        fontFamily: 'Inter',
    },
});