import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  CheckIcon,
  Badge,
  IconButton,
  Menu,
  Pressable,
  useToast,
  AlertDialog,
  Checkbox,
  ScrollView,
} from 'native-base';
import { RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SearchBar, DataTable } from '../../components/management';
import { LoadingSpinner } from '../../components/common';
import { ProductService } from '../../services/productService';
import { Product, Category, ProductSearchParams } from '../../types/product';

interface ProductListItem extends Product {
  selected?: boolean;
}

export const ProductsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const toast = useToast();
  const cancelRef = React.useRef(null);

  const loadProducts = async (page: number = 0, showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const params: ProductSearchParams = {
        page,
        size: 20,
        sortBy,
        sortDirection,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      if (selectedCategory) {
        params.categoryId = parseInt(selectedCategory);
      }
      
      if (statusFilter) {
        params.active = statusFilter === 'active';
      }

      const response = await ProductService.getProducts(params);
      const productsWithSelection = response.content.map(product => ({
        ...product,
        selected: selectedProducts.includes(product.id),
      }));
      
      setProducts(productsWithSelection);
      setCurrentPage(response.number);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to load products',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await ProductService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCategories();
      loadProducts();
    }, [searchQuery, selectedCategory, statusFilter, sortBy, sortDirection])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts(0, false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
  };

  const handleProductSelect = (productId: number) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        const isSelected = !product.selected;
        if (isSelected) {
          setSelectedProducts(prev => [...prev, productId]);
        } else {
          setSelectedProducts(prev => prev.filter(id => id !== productId));
        }
        return { ...product, selected: isSelected };
      }
      return product;
    });
    setProducts(updatedProducts);
    setShowBulkActions(selectedProducts.length > 0 || updatedProducts.some(p => p.selected));
  };

  const handleSelectAll = () => {
    const allSelected = products.every(p => p.selected);
    const updatedProducts = products.map(product => ({
      ...product,
      selected: !allSelected,
    }));
    setProducts(updatedProducts);
    
    if (allSelected) {
      setSelectedProducts([]);
      setShowBulkActions(false);
    } else {
      setSelectedProducts(products.map(p => p.id));
      setShowBulkActions(true);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await ProductService.deleteProduct(productId);
      toast.show({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      loadProducts(currentPage, false);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to delete product',
      });
    }
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleBulkDelete = async () => {
    try {
      await ProductService.bulkDeleteProducts(selectedProducts);
      toast.show({
        title: 'Success',
        description: `${selectedProducts.length} products deleted successfully`,
      });
      setSelectedProducts([]);
      setShowBulkActions(false);
      loadProducts(currentPage, false);
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to delete products',
      });
    }
    setBulkDeleteDialogOpen(false);
  };

  const handleBulkStatusUpdate = async (active: boolean) => {
    try {
      await ProductService.bulkUpdateProducts(selectedProducts, { active });
      toast.show({
        title: 'Success',
        description: `${selectedProducts.length} products updated successfully`,
      });
      setSelectedProducts([]);
      setShowBulkActions(false);
      loadProducts(currentPage, false);
    } catch (error) {
      console.error('Error bulk updating products:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to update products',
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusBadge = (product: Product) => {
    if (!product.active) {
      return <Badge colorScheme="gray">Inactive</Badge>;
    }
    if (product.stockQuantity === 0) {
      return <Badge colorScheme="red">Out of Stock</Badge>;
    }
    if (product.stockQuantity < 10) {
      return <Badge colorScheme="orange">Low Stock</Badge>;
    }
    return <Badge colorScheme="green">In Stock</Badge>;
  };

  const columns = [
    {
      key: 'select',
      title: (
        <Checkbox
          isChecked={products.length > 0 && products.every(p => p.selected)}
          onChange={handleSelectAll}
          aria-label="Select all products"
          value="select-all"
        />
      ),
      width: '40px',
      render: (product: ProductListItem) => (
        <Checkbox
          isChecked={product.selected || false}
          onChange={() => handleProductSelect(product.id)}
          aria-label={`Select ${product.name}`}
          value={product.id.toString()}
        />
      ),
    },
    {
      key: 'name',
      title: 'Product Name',
      render: (product: Product) => (
        <VStack>
          <Text fontSize="sm" fontWeight="medium" numberOfLines={1}>
            {product.name}
          </Text>
          <Text fontSize="xs" color="gray.500" numberOfLines={1}>
            {product.category.name}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'price',
      title: 'Price',
      width: '100px',
      render: (product: Product) => (
        <Text fontSize="sm" fontWeight="medium">
          {formatPrice(product.price)}
        </Text>
      ),
    },
    {
      key: 'stock',
      title: 'Stock',
      width: '60px',
      render: (product: Product) => (
        <Text fontSize="sm" textAlign="center">
          {product.stockQuantity}
        </Text>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      width: '120px',
      render: (product: Product) => getStatusBadge(product),
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '80px',
      render: (product: Product) => (
        <Menu
          trigger={(triggerProps) => (
            <IconButton
              {...triggerProps}
              icon={<Ionicons name="ellipsis-vertical" size={16} />}
              variant="ghost"
              size="sm"
            />
          )}
        >
          <Menu.Item onPress={() => (navigation as any).navigate('ProductForm', { productId: product.id })}>
            <HStack space={2} alignItems="center">
              <Ionicons name="create-outline" size={16} />
              <Text>Edit</Text>
            </HStack>
          </Menu.Item>
          <Menu.Item onPress={() => console.log('Duplicate product:', product.id)}>
            <HStack space={2} alignItems="center">
              <Ionicons name="copy-outline" size={16} />
              <Text>Duplicate</Text>
            </HStack>
          </Menu.Item>
          <Menu.Item
            onPress={() => {
              setProductToDelete(product.id);
              setDeleteDialogOpen(true);
            }}
          >
            <HStack space={2} alignItems="center">
              <Ionicons name="trash-outline" size={16} color="red" />
              <Text color="red.500">Delete</Text>
            </HStack>
          </Menu.Item>
        </Menu>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box flex={1} bg="gray.50">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <VStack space={4} p={4}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Products Management
            </Text>
            <HStack space={2}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Ionicons name="folder-outline" size={16} />}
                onPress={() => (navigation as any).navigate('Categories')}
              >
                Categories
              </Button>
              <Button
                colorScheme="primary"
                size="sm"
                leftIcon={<Ionicons name="add" size={16} color="white" />}
                onPress={() => (navigation as any).navigate('ProductForm')}
              >
                Add Product
              </Button>
            </HStack>
          </HStack>

          {/* Bulk Actions */}
          {showBulkActions && (
            <Box bg="blue.50" p={3} rounded="lg" borderWidth={1} borderColor="blue.200">
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="sm" color="blue.700">
                  {selectedProducts.length} products selected
                </Text>
                <HStack space={2}>
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="green"
                    onPress={() => handleBulkStatusUpdate(true)}
                  >
                    Activate
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="orange"
                    onPress={() => handleBulkStatusUpdate(false)}
                  >
                    Deactivate
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="red"
                    onPress={() => setBulkDeleteDialogOpen(true)}
                  >
                    Delete
                  </Button>
                </HStack>
              </HStack>
            </Box>
          )}

          {/* Filters */}
          <VStack space={3}>
            <SearchBar
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChangeText={handleSearch}
            />
            
            <HStack space={3} flexWrap="wrap">
              <Select
                selectedValue={selectedCategory}
                minWidth="150"
                placeholder="All Categories"
                onValueChange={setSelectedCategory}
                _selectedItem={{
                  bg: "primary.100",
                  endIcon: <CheckIcon size="5" />,
                }}
              >
                <Select.Item label="All Categories" value="" />
                {categories.map((category) => (
                  <Select.Item
                    key={category.id}
                    label={category.name}
                    value={category.id.toString()}
                  />
                ))}
              </Select>

              <Select
                selectedValue={statusFilter}
                minWidth="120"
                placeholder="All Status"
                onValueChange={setStatusFilter}
                _selectedItem={{
                  bg: "primary.100",
                  endIcon: <CheckIcon size="5" />,
                }}
              >
                <Select.Item label="All Status" value="" />
                <Select.Item label="Active" value="active" />
                <Select.Item label="Inactive" value="inactive" />
              </Select>

              <Select
                selectedValue={`${sortBy}-${sortDirection}`}
                minWidth="120"
                placeholder="Sort By"
                onValueChange={(value) => {
                  const [field, direction] = value.split('-');
                  setSortBy(field);
                  setSortDirection(direction as 'asc' | 'desc');
                }}
                _selectedItem={{
                  bg: "primary.100",
                  endIcon: <CheckIcon size="5" />,
                }}
              >
                <Select.Item label="Name A-Z" value="name-asc" />
                <Select.Item label="Name Z-A" value="name-desc" />
                <Select.Item label="Price Low-High" value="price-asc" />
                <Select.Item label="Price High-Low" value="price-desc" />
                <Select.Item label="Stock Low-High" value="stockQuantity-asc" />
                <Select.Item label="Stock High-Low" value="stockQuantity-desc" />
                <Select.Item label="Newest First" value="createdAt-desc" />
                <Select.Item label="Oldest First" value="createdAt-asc" />
              </Select>
            </HStack>
          </VStack>

          {/* Products Table */}
          <DataTable
            columns={columns}
            data={products}
            keyExtractor={(item) => item.id.toString()}
            onRowPress={(item) => (navigation as any).navigate('ProductForm', { productId: item.id })}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <HStack justifyContent="center" space={2} mt={4}>
              <IconButton
                icon={<Ionicons name="chevron-back" size={20} />}
                isDisabled={currentPage === 0}
                onPress={() => loadProducts(currentPage - 1)}
              />
              <Text alignSelf="center" fontSize="sm">
                Page {currentPage + 1} of {totalPages}
              </Text>
              <IconButton
                icon={<Ionicons name="chevron-forward" size={20} />}
                isDisabled={currentPage >= totalPages - 1}
                onPress={() => loadProducts(currentPage + 1)}
              />
            </HStack>
          )}
        </VStack>
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Delete Product</AlertDialog.Header>
          <AlertDialog.Body>
            Are you sure you want to delete this product? This action cannot be undone.
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={() => setDeleteDialogOpen(false)}
                ref={cancelRef}
              >
                Cancel
              </Button>
              <Button
                colorScheme="danger"
                onPress={() => productToDelete && handleDeleteProduct(productToDelete)}
              >
                Delete
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Delete Products</AlertDialog.Header>
          <AlertDialog.Body>
            Are you sure you want to delete {selectedProducts.length} products? This action cannot be undone.
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={() => setBulkDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button colorScheme="danger" onPress={handleBulkDelete}>
                Delete All
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
};