import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Category } from '@/types';
import { useAdminStore } from '@/store/adminStore';
import categoryService, { CreateCategoryData, UpdateCategoryData } from '@/services/categoryService';

interface AdminCategoryFormProps {
    category?: Category | undefined;
    onSave: () => void;
    onCancel: () => void;
}

export function AdminCategoryForm({ category, onSave, onCancel }: AdminCategoryFormProps) {
    const { allCategories, addCategory, updateCategory, setLoading, setError } = useAdminStore();
    
    const [formData, setFormData] = useState({
        name: category?.name || '',
        description: category?.description || '',
        parentId: category?.parentId || '',
    });
    
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get available parent categories (exclude current category and its children)
    const getAvailableParentCategories = () => {
        if (!category) return allCategories;
        
        // For editing, exclude the current category and its descendants
        const excludeIds = new Set([category.id]);
        const findDescendants = (parentId: string) => {
            allCategories.forEach(cat => {
                if (cat.parentId === parentId) {
                    excludeIds.add(cat.id);
                    findDescendants(cat.id);
                }
            });
        };
        findDescendants(category.id);
        
        return allCategories.filter(cat => !excludeIds.has(cat.id));
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Category name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Category name must be at least 2 characters';
        }

        // Check for duplicate names (excluding current category when editing)
        const existingCategory = allCategories.find(cat => 
            cat.name.toLowerCase() === formData.name.trim().toLowerCase() &&
            cat.id !== category?.id
        );
        if (existingCategory) {
            newErrors.name = 'A category with this name already exists';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setLoading(true);
        setError(null);

        try {
            if (category) {
                // Update existing category
                const updateData: UpdateCategoryData = {
                    id: category.id,
                    name: formData.name.trim(),
                    description: formData.description.trim() ? formData.description.trim() : undefined,
                    parentId: formData.parentId ? formData.parentId : undefined,
                };
                
                const updatedCategory = await categoryService.updateCategory(updateData);
                updateCategory(updatedCategory);
            } else {
                // Create new category
                const createData: CreateCategoryData = {
                    name: formData.name.trim(),
                    description: formData.description.trim() ? formData.description.trim() : undefined,
                    parentId: formData.parentId ? formData.parentId : undefined,
                };
                
                const newCategory = await categoryService.createCategory(createData);
                addCategory(newCategory);
            }

            onSave();
        } catch (error: any) {
            setError(error.message || 'Failed to save category');
            Alert.alert('Error', error.message || 'Failed to save category');
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const availableParentCategories = getAvailableParentCategories();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.title}>
                    {category ? 'Edit Category' : 'Create New Category'}
                </Text>

                {/* Category Name */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Category Name *</Text>
                    <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        placeholder="Enter category name"
                        placeholderTextColor="#999999"
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                {/* Description */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        placeholder="Enter category description (optional)"
                        placeholderTextColor="#999999"
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Parent Category */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Parent Category</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.parentId}
                            onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                            style={styles.picker}
                        >
                            <Picker.Item label="No Parent (Top Level)" value="" />
                            {availableParentCategories.map((cat) => (
                                <Picker.Item
                                    label={cat.name}
                                    value={cat.id}
                                    key={cat.id}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={onCancel}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.saveButton, isSubmitting && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.saveButtonText}>
                            {isSubmitting ? 'Saving...' : 'Save Category'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    form: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
        marginBottom: 24,
        textAlign: 'center',
    },
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333333',
        fontFamily: 'Inter',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        fontFamily: 'Inter',
        backgroundColor: '#FFFFFF',
        color: '#333333',
    },
    inputError: {
        borderColor: '#D32F2F',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        color: '#333333',
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 14,
        fontFamily: 'Inter',
        marginTop: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 32,
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