import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminProductGrid } from '@/components/admin/AdminProductGrid';
import { AdminProductFilters } from '@/components/admin/AdminProductFilters';
import { AdminProductActions } from '@/components/admin/AdminProductActions';
import { AdminProductFormModal } from '@/components/admin/AdminProductFormModal';
import { useAdminStore } from '@/store/adminStore';
import { Product } from '@/types';
import adminService from '@/services/adminService';

export default function AdminProducts() {
    const {
        selectedProducts,
        selectionMode,
        isLoading,
        setAllProducts,
        setAllCategories,
        setLoading,
        setError,
        addProduct,
        updateProduct,
        removeProduct,
        getFilteredProducts,
        setSelectionMode,
        clearProductSelection,
    } = useAdminStore();

    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [productsResponse, categoriesResponse] = await Promise.all([
                adminService.getAllProducts({ page: 1, limit: 100 }),
                adminService.getAllCategories(),
            ]);
            
            setAllProducts(productsResponse.products);
            setAllCategories(categoriesResponse);
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Failed to load products and categories');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const response = await adminService.getAllProducts({ page: 1, limit: 100 });
            setAllProducts(response.products);
        } catch (error) {
            console.error('Error refreshing products:', error);
            setError('Failed to refresh products');
        } finally {
            setRefreshing(false);
        }
    };

    const handleAddProduct = () => {
        setEditingProduct(undefined);
        setShowProductForm(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setShowProductForm(true);
    };

    const handleDeleteProduct = async (productId: string) => {
        try {
            await adminService.deleteProduct(productId);
            removeProduct(productId);
            Alert.alert('Success', 'Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            Alert.alert('Error', 'Failed to delete product');
        }
    };

    const handleToggleProductStatus = async (productId: string) => {
        try {
            const updatedProduct = await adminService.toggleProductStatus(productId);
            updateProduct(updatedProduct);
            Alert.alert('Success', 'Product status updated successfully');
        } catch (error) {
            console.error('Error updating product status:', error);
            Alert.alert('Error', 'Failed to update product status');
        }
    };

    const handleSaveProduct = (product: Product) => {
        if (editingProduct) {
            updateProduct(product);
            Alert.alert('Success', 'Product updated successfully');
        } else {
            addProduct(product);
            Alert.alert('Success', 'Product created successfully');
        }
        setShowProductForm(false);
        setEditingProduct(undefined);
    };

    const handleCancelProductForm = () => {
        setShowProductForm(false);
        setEditingProduct(undefined);
    };

    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0) return;

        Alert.alert(
            'Delete Products',
            `Are you sure you want to delete ${selectedProducts.length} selected products? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await Promise.all(
                                selectedProducts.map((id) => adminService.deleteProduct(id))
                            );
                            selectedProducts.forEach((id) => removeProduct(id));
                            clearProductSelection();
                            setSelectionMode(false);
                            Alert.alert('Success', 'Products deleted successfully');
                        } catch (error) {
                            console.error('Error deleting products:', error);
                            Alert.alert('Error', 'Failed to delete some products');
                        }
                    }
                }
            ]
        );
    };

    const filteredProducts = getFilteredProducts();

    return (
        <AdminLayout title="Products">
            <View style={styles.container}>
                <View style={styles.header}>
                    <AdminProductFilters />
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.selectionButton}
                            onPress={() => {
                                setSelectionMode(!selectionMode);
                                if (selectionMode) {
                                    clearProductSelection();
                                }
                            }}
                        >
                            <Ionicons 
                                name={selectionMode ? "close" : "checkmark-circle-outline"} 
                                size={20} 
                                color="#666666" 
                            />
                            <Text style={styles.selectionButtonText}>
                                {selectionMode ? 'Cancel' : 'Select'}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleAddProduct}
                        >
                            <Ionicons name="add" size={20} color="#FFFFFF" />
                            <Text style={styles.addButtonText}>Add Product</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {selectionMode && selectedProducts.length > 0 && (
                    <AdminProductActions
                        selectedCount={selectedProducts.length}
                        onBulkDelete={handleBulkDelete}
                        onCancel={() => {
                            clearProductSelection();
                            setSelectionMode(false);
                        }}
                    />
                )}

                <AdminProductGrid
                    products={filteredProducts}
                    isLoading={isLoading}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onToggleStatus={handleToggleProductStatus}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    selectionMode={selectionMode}
                    selectedProducts={selectedProducts}
                    onSelectProduct={(productId) => {
                        const { toggleProductSelection } = useAdminStore.getState();
                        toggleProductSelection(productId);
                    }}
                />

                <AdminProductFormModal
                    visible={showProductForm}
                    product={editingProduct}
                    onSave={handleSaveProduct}
                    onCancel={handleCancelProductForm}
                />
            </View>
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    headerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    selectionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        backgroundColor: '#FFFFFF',
    },
    selectionButtonText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        marginLeft: 4,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000000',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Inter',
        marginLeft: 4,
    },
});