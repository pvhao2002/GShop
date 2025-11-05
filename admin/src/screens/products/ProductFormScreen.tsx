import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,

  Select,
  CheckIcon,
  Button,
  FormControl,
  Switch,
  Image,
  IconButton,
  useToast,
  ScrollView,
  Pressable,
  Badge,
  Divider,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ProductService } from '../../services/productService';
import { LoadingSpinner } from '../../components/common';
import { Product, Category, ProductCreateRequest, ProductUpdateRequest } from '../../types/product';

interface RouteParams {
  productId?: number;
}

export const ProductFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = (route.params as RouteParams) || {};
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    active: true,
    images: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
  });

  // Variant inputs
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadCategories = async () => {
    try {
      const categoriesData = await ProductService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to load categories',
      });
    }
  };

  const loadProduct = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const product = await ProductService.getProduct(productId);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stockQuantity: product.stockQuantity.toString(),
        categoryId: product.category.id.toString(),
        active: product.active,
        images: product.images,
        sizes: product.sizes,
        colors: product.colors,
      });
    } catch (error) {
      console.error('Error loading product:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to load product',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.stockQuantity || isNaN(Number(formData.stockQuantity)) || Number(formData.stockQuantity) < 0) {
      newErrors.stockQuantity = 'Valid stock quantity is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (formData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        categoryId: Number(formData.categoryId),
        active: formData.active,
        images: formData.images,
        sizes: formData.sizes,
        colors: formData.colors,
      };

      if (productId) {
        // Update existing product
        const updateData: ProductUpdateRequest = {
          id: productId,
          ...productData,
        };
        await ProductService.updateProduct(updateData);
        toast.show({
          title: 'Success',
          description: 'Product updated successfully',
        });
      } else {
        // Create new product
        const createData: ProductCreateRequest = productData;
        await ProductService.createProduct(createData);
        toast.show({
          title: 'Success',
          description: 'Product created successfully',
        });
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to save product',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImagePicker = async () => {
    // TODO: Implement image picker after installing expo-image-picker
    toast.show({
      title: 'Coming Soon',
      description: 'Image upload functionality will be available after installing expo-image-picker',
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, newSize.trim()],
      }));
      setNewSize('');
    }
  };

  const removeSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size),
    }));
  };

  const addColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor.trim()],
      }));
      setNewColor('');
    }
  };

  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color),
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box flex={1} bg="gray.50">
      <ScrollView>
        <VStack space={6} p={4}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space={3} alignItems="center">
              <IconButton
                icon={<Ionicons name="arrow-back" size={24} />}
                onPress={() => navigation.goBack()}
              />
              <Text fontSize="xl" fontWeight="bold">
                {productId ? 'Edit Product' : 'Add New Product'}
              </Text>
            </HStack>
            <Button
              colorScheme="primary"
              isLoading={saving}
              onPress={handleSave}
            >
              {productId ? 'Update' : 'Create'}
            </Button>
          </HStack>

          {/* Basic Information */}
          <Box bg="white" p={4} rounded="lg" shadow={1}>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Basic Information
            </Text>
            
            <VStack space={4}>
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormControl.Label>Product Name</FormControl.Label>
                <Input
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter product name"
                />
                <FormControl.ErrorMessage>{errors.name}</FormControl.ErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.description}>
                <FormControl.Label>Description</FormControl.Label>
                <Input
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Enter product description"
                  multiline
                  numberOfLines={4}
                />
                <FormControl.ErrorMessage>{errors.description}</FormControl.ErrorMessage>
              </FormControl>

              <HStack space={4}>
                <FormControl flex={1} isRequired isInvalid={!!errors.price}>
                  <FormControl.Label>Price (VND)</FormControl.Label>
                  <Input
                    value={formData.price}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                  <FormControl.ErrorMessage>{errors.price}</FormControl.ErrorMessage>
                </FormControl>

                <FormControl flex={1} isRequired isInvalid={!!errors.stockQuantity}>
                  <FormControl.Label>Stock Quantity</FormControl.Label>
                  <Input
                    value={formData.stockQuantity}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, stockQuantity: text }))}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                  <FormControl.ErrorMessage>{errors.stockQuantity}</FormControl.ErrorMessage>
                </FormControl>
              </HStack>

              <FormControl isRequired isInvalid={!!errors.categoryId}>
                <FormControl.Label>Category</FormControl.Label>
                <Select
                  selectedValue={formData.categoryId}
                  placeholder="Select category"
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  _selectedItem={{
                    bg: "primary.100",
                    endIcon: <CheckIcon size="5" />,
                  }}
                >
                  {categories.map((category) => (
                    <Select.Item
                      key={category.id}
                      label={category.name}
                      value={category.id.toString()}
                    />
                  ))}
                </Select>
                <FormControl.ErrorMessage>{errors.categoryId}</FormControl.ErrorMessage>
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
          </Box>

          {/* Product Images */}
          <Box bg="white" p={4} rounded="lg" shadow={1}>
            <HStack justifyContent="space-between" alignItems="center" mb={4}>
              <Text fontSize="lg" fontWeight="semibold">
                Product Images
              </Text>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Ionicons name="camera" size={16} />}
                onPress={handleImagePicker}
              >
                Add Image
              </Button>
            </HStack>

            {errors.images && (
              <Text color="red.500" fontSize="sm" mb={2}>
                {errors.images}
              </Text>
            )}

            <HStack space={3} flexWrap="wrap">
              {formData.images.map((image, index) => (
                <Box key={index} position="relative" mb={3}>
                  <Image
                    source={{ uri: image }}
                    alt={`Product image ${index + 1}`}
                    size="20"
                    rounded="md"
                  />
                  <IconButton
                    icon={<Ionicons name="close-circle" size={20} color="red" />}
                    position="absolute"
                    top="-2"
                    right="-2"
                    size="sm"
                    onPress={() => removeImage(index)}
                  />
                </Box>
              ))}
              
              {formData.images.length === 0 && (
                <Box
                  w="20"
                  h="20"
                  bg="gray.100"
                  rounded="md"
                  justifyContent="center"
                  alignItems="center"
                  borderWidth={2}
                  borderColor="gray.300"
                  borderStyle="dashed"
                >
                  <Ionicons name="image-outline" size={32} color="gray" />
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    No images
                  </Text>
                </Box>
              )}
            </HStack>
          </Box>

          {/* Product Variants */}
          <Box bg="white" p={4} rounded="lg" shadow={1}>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Product Variants
            </Text>

            {/* Sizes */}
            <VStack space={3} mb={4}>
              <Text fontSize="md" fontWeight="medium">Sizes</Text>
              <HStack space={2} alignItems="center">
                <Input
                  flex={1}
                  value={newSize}
                  onChangeText={setNewSize}
                  placeholder="Enter size (e.g., S, M, L, XL)"
                />
                <Button size="sm" onPress={addSize} isDisabled={!newSize.trim()}>
                  Add
                </Button>
              </HStack>
              <HStack space={2} flexWrap="wrap">
                {formData.sizes.map((size) => (
                  <Badge
                    key={size}
                    colorScheme="blue"
                    variant="solid"
                    rounded="full"
                    px={3}
                    py={1}
                  >
                    <HStack space={1} alignItems="center">
                      <Text color="white" fontSize="sm">{size}</Text>
                      <Pressable onPress={() => removeSize(size)}>
                        <Ionicons name="close" size={14} color="white" />
                      </Pressable>
                    </HStack>
                  </Badge>
                ))}
              </HStack>
            </VStack>

            <Divider />

            {/* Colors */}
            <VStack space={3} mt={4}>
              <Text fontSize="md" fontWeight="medium">Colors</Text>
              <HStack space={2} alignItems="center">
                <Input
                  flex={1}
                  value={newColor}
                  onChangeText={setNewColor}
                  placeholder="Enter color (e.g., Red, Blue, Black)"
                />
                <Button size="sm" onPress={addColor} isDisabled={!newColor.trim()}>
                  Add
                </Button>
              </HStack>
              <HStack space={2} flexWrap="wrap">
                {formData.colors.map((color) => (
                  <Badge
                    key={color}
                    colorScheme="green"
                    variant="solid"
                    rounded="full"
                    px={3}
                    py={1}
                  >
                    <HStack space={1} alignItems="center">
                      <Text color="white" fontSize="sm">{color}</Text>
                      <Pressable onPress={() => removeColor(color)}>
                        <Ionicons name="close" size={14} color="white" />
                      </Pressable>
                    </HStack>
                  </Badge>
                ))}
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>
    </Box>
  );
};