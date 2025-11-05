import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Menu,
  useToast,
  AlertDialog,
  Modal,
  FormControl,
  Input,

  Select,
  CheckIcon,
  Switch,
  ScrollView,
  Badge,
} from 'native-base';
import { RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LoadingSpinner } from '../../components/common';
import { ProductService } from '../../services/productService';
import { Category, CategoryCreateRequest, CategoryUpdateRequest } from '../../types/product';

export const CategoriesScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const toast = useToast();
  const cancelRef = React.useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadCategories = async (showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true);
      const categoriesData = await ProductService.getCategories();
      
      // Build hierarchical structure
      const categoryMap = new Map<number, Category>();
      const rootCategories: Category[] = [];
      
      // First pass: create map
      categoriesData.forEach(category => {
        categoryMap.set(category.id, { ...category, children: [] });
      });
      
      // Second pass: build hierarchy
      categoriesData.forEach(category => {
        const categoryWithChildren = categoryMap.get(category.id)!;
        if (category.parentId) {
          const parent = categoryMap.get(category.parentId);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(categoryWithChildren);
          }
        } else {
          rootCategories.push(categoryWithChildren);
        }
      });
      
      setCategories(rootCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to load categories',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadCategories(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parentId: '',
      active: true,
    });
    setErrors({});
    setEditingCategory(null);
  };

  const openCreateForm = () => {
    resetForm();
    setCategoryFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description,
      parentId: category.parentId?.toString() || '',
      active: category.active,
    });
    setEditingCategory(category);
    setCategoryFormOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Category description is required';
    }

    // Check for circular reference
    if (editingCategory && formData.parentId) {
      const parentId = parseInt(formData.parentId);
      if (parentId === editingCategory.id) {
        newErrors.parentId = 'Category cannot be its own parent';
      }
      // TODO: Add deeper circular reference check
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCategory = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        parentId: formData.parentId ? parseInt(formData.parentId) : undefined,
        active: formData.active,
      };

      if (editingCategory) {
        // Update existing category
        const updateData: CategoryUpdateRequest = {
          id: editingCategory.id,
          ...categoryData,
        };
        await ProductService.updateCategory(updateData);
        toast.show({
          title: 'Success',
          description: 'Category updated successfully',
        });
      } else {
        // Create new category
        const createData: CategoryCreateRequest = categoryData;
        await ProductService.createCategory(createData);
        toast.show({
          title: 'Success',
          description: 'Category created successfully',
        });
      }

      setCategoryFormOpen(false);
      resetForm();
      loadCategories(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to save category',
      });
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await ProductService.deleteCategory(categoryId);
      toast.show({
        title: 'Success',
        description: 'Category deleted successfully',
      });
      loadCategories(false);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to delete category. Make sure no products are assigned to this category.',
      });
    }
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const getAllCategories = (categories: Category[]): Category[] => {
    const result: Category[] = [];
    
    const traverse = (cats: Category[]) => {
      cats.forEach(cat => {
        result.push(cat);
        if (cat.children && cat.children.length > 0) {
          traverse(cat.children);
        }
      });
    };
    
    traverse(categories);
    return result;
  };

  const renderCategory = (category: Category, level: number = 0): React.ReactNode => {
    const indent = level * 20;
    
    return (
      <React.Fragment key={category.id}>
        <Box
          bg="white"
          p={3}
          mb={2}
          rounded="lg"
          shadow={1}
          ml={indent}
          borderLeftWidth={level > 0 ? 3 : 0}
          borderLeftColor="primary.200"
        >
          <HStack justifyContent="space-between" alignItems="center">
            <VStack flex={1} space={1}>
              <HStack alignItems="center" space={2}>
                <Text fontSize="md" fontWeight="semibold">
                  {category.name}
                </Text>
                <Badge
                  colorScheme={category.active ? 'green' : 'gray'}
                  variant="solid"
                  rounded="full"
                >
                  {category.active ? 'Active' : 'Inactive'}
                </Badge>
                {category.children && category.children.length > 0 && (
                  <Badge colorScheme="blue" variant="outline" rounded="full">
                    {category.children.length} subcategories
                  </Badge>
                )}
              </HStack>
              <Text fontSize="sm" color="gray.600" numberOfLines={2}>
                {category.description}
              </Text>
            </VStack>
            
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
              <Menu.Item onPress={() => openEditForm(category)}>
                <HStack space={2} alignItems="center">
                  <Ionicons name="create-outline" size={16} />
                  <Text>Edit</Text>
                </HStack>
              </Menu.Item>
              <Menu.Item onPress={() => openCreateForm()}>
                <HStack space={2} alignItems="center">
                  <Ionicons name="add-outline" size={16} />
                  <Text>Add Subcategory</Text>
                </HStack>
              </Menu.Item>
              <Menu.Item
                onPress={() => {
                  setCategoryToDelete(category.id);
                  setDeleteDialogOpen(true);
                }}
              >
                <HStack space={2} alignItems="center">
                  <Ionicons name="trash-outline" size={16} color="red" />
                  <Text color="red.500">Delete</Text>
                </HStack>
              </Menu.Item>
            </Menu>
          </HStack>
        </Box>
        
        {category.children && category.children.map(child => renderCategory(child, level + 1))}
      </React.Fragment>
    );
  };

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
              Categories Management
            </Text>
            <Button
              colorScheme="primary"
              size="sm"
              leftIcon={<Ionicons name="add" size={16} color="white" />}
              onPress={openCreateForm}
            >
              Add Category
            </Button>
          </HStack>

          {/* Categories List */}
          <VStack space={2}>
            {categories.length > 0 ? (
              categories.map(category => renderCategory(category))
            ) : (
              <Box bg="white" p={8} rounded="lg" alignItems="center">
                <Ionicons name="folder-outline" size={48} color="gray" />
                <Text color="gray.500" fontSize="md" mt={2}>
                  No categories found
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  mt={3}
                  onPress={openCreateForm}
                >
                  Create First Category
                </Button>
              </Box>
            )}
          </VStack>
        </VStack>
      </ScrollView>

      {/* Category Form Modal */}
      <Modal isOpen={categoryFormOpen} onClose={() => setCategoryFormOpen(false)} size="lg">
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormControl.Label>Category Name</FormControl.Label>
                <Input
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter category name"
                />
                <FormControl.ErrorMessage>{errors.name}</FormControl.ErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.description}>
                <FormControl.Label>Description</FormControl.Label>
                <Input
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Enter category description"
                  multiline
                  numberOfLines={4}
                />
                <FormControl.ErrorMessage>{errors.description}</FormControl.ErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.parentId}>
                <FormControl.Label>Parent Category (Optional)</FormControl.Label>
                <Select
                  selectedValue={formData.parentId}
                  placeholder="Select parent category"
                  onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
                  _selectedItem={{
                    bg: "primary.100",
                    endIcon: <CheckIcon size="5" />,
                  }}
                >
                  <Select.Item label="None (Root Category)" value="" />
                  {getAllCategories(categories)
                    .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                    .map((category) => (
                      <Select.Item
                        key={category.id}
                        label={category.name}
                        value={category.id.toString()}
                      />
                    ))}
                </Select>
                <FormControl.ErrorMessage>{errors.parentId}</FormControl.ErrorMessage>
              </FormControl>

              <FormControl>
                <HStack justifyContent="space-between" alignItems="center">
                  <FormControl.Label>Active Status</FormControl.Label>
                  <Switch
                    isChecked={formData.active}
                    onToggle={(value) => setFormData(prev => ({ ...prev, active: value }))}
                  />
                </HStack>
              </FormControl>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setCategoryFormOpen(false)}
              >
                Cancel
              </Button>
              <Button colorScheme="primary" onPress={handleSaveCategory}>
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Delete Category</AlertDialog.Header>
          <AlertDialog.Body>
            Are you sure you want to delete this category? This action cannot be undone.
            All subcategories and products in this category will need to be reassigned.
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
                onPress={() => categoryToDelete && handleDeleteCategory(categoryToDelete)}
              >
                Delete
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
};