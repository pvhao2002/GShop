import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCategoryList } from '@/components/admin/AdminCategoryList';
import { AdminCategoryFormModal } from '@/components/admin/AdminCategoryFormModal';
import { AdminCategoryProductAssignment } from '@/components/admin/AdminCategoryProductAssignment';
import { useAdminStore } from '@/store/adminStore';
import { Category } from '@/types';
import categoryService from '@/services/categoryService';

export default function AdminCategories() {
    const { 
        allCategories, 
        setAllCategories, 
        isLoading, 
        setLoading, 
        setError 
    } = useAdminStore();
    
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>();
    const [showProductAssignment, setShowProductAssignment] = useState(false);
    const [assignmentCategory, setAssignmentCategory] = useState<Category | undefined>();

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const categories = await categoryService.getCategories();
            setAllCategories(categories);
        } catch (error: any) {
            setError(error.message || 'Failed to load categories');
            Alert.alert('Error', error.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = () => {
        setEditingCategory(undefined);
        setShowCategoryForm(true);
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setShowCategoryForm(true);
    };

    const handleCategoryFormSave = () => {
        setShowCategoryForm(false);
        setEditingCategory(undefined);
        // Categories are already updated in the store by the form component
    };

    const handleCategoryFormCancel = () => {
        setShowCategoryForm(false);
        setEditingCategory(undefined);
    };

    const handleManageProducts = (category: Category) => {
        setAssignmentCategory(category);
        setShowProductAssignment(true);
    };

    const handleProductAssignmentClose = () => {
        setShowProductAssignment(false);
        setAssignmentCategory(undefined);
    };

    return (
        <>
            <AdminLayout title="Categories">
                <View style={styles.container}>
                    {/* Header with Create Button */}
                    <View style={styles.header}>
                        <View style={styles.headerInfo}>
                            <Text style={styles.title}>Category Management</Text>
                            <Text style={styles.subtitle}>
                                {allCategories.length} categories
                            </Text>
                        </View>
                        
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={handleCreateCategory}
                            disabled={isLoading}
                        >
                            <Ionicons name="add" size={20} color="#FFFFFF" />
                            <Text style={styles.createButtonText}>Create</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Category List */}
                    <View style={styles.listContainer}>
                        <AdminCategoryList 
                            onEdit={handleEditCategory} 
                            onManageProducts={handleManageProducts}
                        />
                    </View>
                </View>
            </AdminLayout>

            {/* Category Form Modal */}
            <AdminCategoryFormModal
                visible={showCategoryForm}
                category={editingCategory}
                onSave={handleCategoryFormSave}
                onCancel={handleCategoryFormCancel}
            />

            {/* Product Assignment Modal */}
            <Modal
                visible={showProductAssignment}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleProductAssignmentClose}
            >
                {assignmentCategory && (
                    <AdminCategoryProductAssignment
                        category={assignmentCategory}
                        onClose={handleProductAssignmentClose}
                    />
                )}
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
    },
    subtitle: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        marginTop: 2,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000000',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    createButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFFFFF',
        fontFamily: 'Inter',
    },
    listContainer: {
        flex: 1,
        padding: 16,
    },
});