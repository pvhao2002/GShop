import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, Category, Size, Color } from '@/types';
import { FormInput } from '@/components/ui/FormInput';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { validateProductData } from '@/utils/validation';
import { useAdminStore } from '@/store/adminStore';
import adminService from '@/services/adminService';

interface AdminProductFormProps {
  product?: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  images: string[];
  selectedSizes: string[];
  selectedColors: string[];
  inventory: Array<{
    sizeId: string;
    colorId: string;
    quantity: string;
  }>;
}

const AVAILABLE_SIZES: Size[] = [
  { id: 'xs', name: 'XS', value: 'xs' },
  { id: 's', name: 'S', value: 's' },
  { id: 'm', name: 'M', value: 'm' },
  { id: 'l', name: 'L', value: 'l' },
  { id: 'xl', name: 'XL', value: 'xl' },
  { id: 'xxl', name: 'XXL', value: 'xxl' },
];

const AVAILABLE_COLORS: Color[] = [
  { id: 'black', name: 'Black', hexCode: '#000000' },
  { id: 'white', name: 'White', hexCode: '#FFFFFF' },
  { id: 'gray', name: 'Gray', hexCode: '#808080' },
  { id: 'navy', name: 'Navy', hexCode: '#000080' },
  { id: 'red', name: 'Red', hexCode: '#FF0000' },
  { id: 'blue', name: 'Blue', hexCode: '#0000FF' },
  { id: 'green', name: 'Green', hexCode: '#008000' },
  { id: 'pink', name: 'Pink', hexCode: '#FFC0CB' },
  { id: 'beige', name: 'Beige', hexCode: '#F5F5DC' },
  { id: 'brown', name: 'Brown', hexCode: '#A52A2A' },
];

export const AdminProductForm: React.FC<AdminProductFormProps> = ({
  product,
  onSave,
  onCancel,
}) => {
  const { allCategories, isLoading } = useAdminStore();
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    images: [],
    selectedSizes: [],
    selectedColors: [],
    inventory: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        categoryId: product.category.id,
        images: product.images,
        selectedSizes: product.sizes.map((s: Size) => s.id),
        selectedColors: product.colors.map((c: Color) => c.id),
        inventory: product.inventory.map((inv) => ({
          sizeId: inv.sizeId,
          colorId: inv.colorId,
          quantity: inv.quantity.toString(),
        })),
      });
    }
  }, [product]);

  useEffect(() => {
    // Generate inventory combinations when sizes or colors change
    if (formData.selectedSizes.length > 0 && formData.selectedColors.length > 0) {
      const newInventory: ProductFormData['inventory'] = [];
      
      formData.selectedSizes.forEach((sizeId: string) => {
        formData.selectedColors.forEach((colorId: string) => {
          const existing = formData.inventory.find(
            (inv) => inv.sizeId === sizeId && inv.colorId === colorId
          );
          newInventory.push({
            sizeId,
            colorId,
            quantity: existing?.quantity || '0',
          });
        });
      });

      setFormData(prev => ({ ...prev, inventory: newInventory }));
    }
  }, [formData.selectedSizes, formData.selectedColors]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    const basicValidation = validateProductData({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      categoryId: formData.categoryId,
    });

    basicValidation.forEach(error => {
      if (error.includes('name')) newErrors.name = error;
      if (error.includes('description')) newErrors.description = error;
      if (error.includes('price')) newErrors.price = error;
      if (error.includes('category')) newErrors.categoryId = error;
    });

    // Additional validation
    if (formData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    if (formData.selectedSizes.length === 0) {
      newErrors.sizes = 'At least one size must be selected';
    }

    if (formData.selectedColors.length === 0) {
      newErrors.colors = 'At least one color must be selected';
    }

    // Validate inventory quantities
    const hasInvalidQuantity = formData.inventory.some((inv) => {
      const qty = parseInt(inv.quantity);
      return isNaN(qty) || qty < 0;
    });

    if (hasInvalidQuantity) {
      newErrors.inventory = 'All inventory quantities must be valid numbers (0 or greater)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }

    setIsSaving(true);

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        sizes: formData.selectedSizes,
        colors: formData.selectedColors,
        images: formData.images,
        inventory: formData.inventory.map((inv) => ({
          sizeId: inv.sizeId,
          colorId: inv.colorId,
          quantity: parseInt(inv.quantity),
        })),
      };

      let savedProduct: Product;
      if (product) {
        savedProduct = await adminService.updateProduct(product.id, productData);
      } else {
        savedProduct = await adminService.createProduct(productData);
      }

      onSave(savedProduct);
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert(
        'Error',
        'Failed to save product. Please check your connection and try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSize = (sizeId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSizes: prev.selectedSizes.includes(sizeId)
        ? prev.selectedSizes.filter((id) => id !== sizeId)
        : [...prev.selectedSizes, sizeId],
    }));
  };

  const toggleColor = (colorId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedColors: prev.selectedColors.includes(colorId)
        ? prev.selectedColors.filter((id) => id !== colorId)
        : [...prev.selectedColors, colorId],
    }));
  };

  const updateInventoryQuantity = (sizeId: string, colorId: string, quantity: string) => {
    setFormData((prev) => ({
      ...prev,
      inventory: prev.inventory.map((inv) =>
        inv.sizeId === sizeId && inv.colorId === colorId
          ? { ...inv, quantity }
          : inv
      ),
    }));
  };

  const getSizeName = (sizeId: string) => {
    return AVAILABLE_SIZES.find((s) => s.id === sizeId)?.name || sizeId;
  };

  const getColorName = (colorId: string) => {
    return AVAILABLE_COLORS.find((c) => c.id === colorId)?.name || colorId;
  };

  const getColorHex = (colorId: string) => {
    return AVAILABLE_COLORS.find((c) => c.id === colorId)?.hexCode || '#000000';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner message="Loading form data..." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Ionicons name="close" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {product ? 'Edit Product' : 'Add New Product'}
        </Text>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <LoadingSpinner size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <FormInput
          label="Product Name"
          value={formData.name}
          onChangeText={(name) => setFormData((prev) => ({ ...prev, name }))}
          placeholder="Enter product name"
          error={errors.name}
          isRequired
        />

        <FormInput
          label="Description"
          value={formData.description}
          onChangeText={(description) => setFormData((prev) => ({ ...prev, description }))}
          placeholder="Enter product description"
          multiline
          numberOfLines={4}
          error={errors.description}
          isRequired
          inputStyle={styles.textArea}
        />

        <FormInput
          label="Price"
          value={formData.price}
          onChangeText={(price) => setFormData((prev) => ({ ...prev, price }))}
          placeholder="0.00"
          keyboardType="decimal-pad"
          error={errors.price}
          isRequired
        />

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            Category <Text style={styles.required}>*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
            {allCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  formData.categoryId === category.id && styles.categoryChipSelected,
                ]}
                onPress={() => setFormData((prev) => ({ ...prev, categoryId: category.id }))}
              >
                <Text style={[
                  styles.categoryChipText,
                  formData.categoryId === category.id && styles.categoryChipTextSelected,
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId}</Text>}
        </View>

        <ImageUploader
          label="Product Images"
          maxImages={5}
          images={formData.images}
          onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
          error={errors.images}
          isRequired
        />

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            Available Sizes <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.chipContainer}>
            {AVAILABLE_SIZES.map((size) => (
              <TouchableOpacity
                key={size.id}
                style={[
                  styles.chip,
                  formData.selectedSizes.includes(size.id) && styles.chipSelected,
                ]}
                onPress={() => toggleSize(size.id)}
              >
                <Text style={[
                  styles.chipText,
                  formData.selectedSizes.includes(size.id) && styles.chipTextSelected,
                ]}>
                  {size.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.sizes && <Text style={styles.errorText}>{errors.sizes}</Text>}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            Available Colors <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.chipContainer}>
            {AVAILABLE_COLORS.map((color) => (
              <TouchableOpacity
                key={color.id}
                style={[
                  styles.colorChip,
                  formData.selectedColors.includes(color.id) && styles.colorChipSelected,
                ]}
                onPress={() => toggleColor(color.id)}
              >
                <View 
                  style={[styles.colorSwatch, { backgroundColor: color.hexCode }]} 
                />
                <Text style={[
                  styles.colorChipText,
                  formData.selectedColors.includes(color.id) && styles.colorChipTextSelected,
                ]}>
                  {color.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.colors && <Text style={styles.errorText}>{errors.colors}</Text>}
        </View>

        {formData.inventory.length > 0 && (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Inventory Management <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.fieldDescription}>
              Set the quantity for each size and color combination
            </Text>
            
            {formData.inventory.map((inv) => (
              <View key={`${inv.sizeId}-${inv.colorId}`} style={styles.inventoryRow}>
                <View style={styles.inventoryInfo}>
                  <View style={styles.inventoryVariant}>
                    <View 
                      style={[styles.colorDot, { backgroundColor: getColorHex(inv.colorId) }]} 
                    />
                    <Text style={styles.inventoryText}>
                      {getSizeName(inv.sizeId)} • {getColorName(inv.colorId)}
                    </Text>
                  </View>
                </View>
                <FormInput
                  label=""
                  value={inv.quantity}
                  onChangeText={(quantity) => updateInventoryQuantity(inv.sizeId, inv.colorId, quantity)}
                  placeholder="0"
                  keyboardType="number-pad"
                  containerStyle={styles.quantityInput}
                />
              </View>
            ))}
            {errors.inventory && <Text style={styles.errorText}>{errors.inventory}</Text>}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Poppins',
  },
  saveButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  form: {
    flex: 1,
    paddingHorizontal: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  fieldDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    fontFamily: 'Inter',
  },
  required: {
    color: '#D32F2F',
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  chipText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  colorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    marginBottom: 8,
  },
  colorChipSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  colorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  colorChipText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
  },
  colorChipTextSelected: {
    color: '#FFFFFF',
  },
  inventoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  inventoryInfo: {
    flex: 1,
  },
  inventoryVariant: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  inventoryText: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Inter',
  },
  quantityInput: {
    width: 80,
    marginBottom: 0,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    marginTop: 4,
    fontFamily: 'Inter',
  },
  bottomSpacing: {
    height: 32,
  },
});