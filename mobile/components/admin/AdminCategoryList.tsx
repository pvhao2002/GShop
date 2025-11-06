import { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '@/types';
import { useAdminStore } from '@/store/adminStore';
import categoryService from '@/services/categoryService';

interface CategoryItemProps {
    category: Category;
    level: number;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onManageProducts: (category: Category) => void;
    children: Category[];
}

function CategoryItem({ category, level, onEdit, onDelete, onManageProducts, children }: CategoryItemProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    
    const hasChildren = children.length > 0;
    const indentWidth = level * 20;

    return (
        <View>
            <View style={[styles.categoryItem, { marginLeft: indentWidth }]}>
                <View style={styles.categoryInfo}>
                    {hasChildren && (
                        <TouchableOpacity
                            onPress={() => setIsExpanded(!isExpanded)}
                            style={styles.expandButton}
                        >
                            <Ionicons
                                name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                                size={16}
                                color="#666666"
                            />
                        </TouchableOpacity>
                    )}
                    
                    <View style={styles.categoryDetails}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        {category.description && (
                            <Text style={styles.categoryDescription}>{category.description}</Text>
                        )}
                    </View>
                </View>

                <View style={styles.categoryActions}>
                    <TouchableOpacity
                        onPress={() => onManageProducts(category)}
                        style={styles.actionButton}
                    >
                        <Ionicons name="albums" size={16} color="#4A5D23" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={() => onEdit(category)}
                        style={styles.actionButton}
                    >
                        <Ionicons name="pencil" size={16} color="#666666" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={() => onDelete(category)}
                        style={styles.actionButton}
                    >
                        <Ionicons name="trash" size={16} color="#D32F2F" />
                    </TouchableOpacity>
                </View>
            </View>

            {hasChildren && isExpanded && (
                <View>
                    {children.map((child) => (
                        <CategoryItemContainer
                            key={child.id}
                            category={child}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onManageProducts={onManageProducts}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

interface CategoryItemContainerProps {
    category: Category;
    level: number;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onManageProducts: (category: Category) => void;
}

function CategoryItemContainer({ category, level, onEdit, onDelete, onManageProducts }: CategoryItemContainerProps) {
    const { allCategories } = useAdminStore();
    
    const children = allCategories.filter(cat => cat.parentId === category.id);
    
    return (
        <CategoryItem
            category={category}
            level={level}
            onEdit={onEdit}
            onDelete={onDelete}
            onManageProducts={onManageProducts}
            children={children}
        />
    );
}

interface AdminCategoryListProps {
    onEdit: (category: Category) => void;
    onManageProducts: (category: Category) => void;
}

export function AdminCategoryList({ onEdit, onManageProducts }: AdminCategoryListProps) {
    const { allCategories, removeCategory, setLoading, setError } = useAdminStore();
    
    // Get root categories (categories without parent)
    const rootCategories = allCategories.filter(category => !category.parentId);

    const handleDelete = async (category: Category) => {
        // Check if category has children
        const hasChildren = allCategories.some(cat => cat.parentId === category.id);
        
        if (hasChildren) {
            Alert.alert(
                'Cannot Delete Category',
                'This category has subcategories. Please delete or move the subcategories first.',
                [{ text: 'OK' }]
            );
            return;
        }

        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        setError(null);
                        
                        try {
                            await categoryService.deleteCategory(category.id);
                            removeCategory(category.id);
                        } catch (error: any) {
                            setError(error.message || 'Failed to delete category');
                            Alert.alert('Error', error.message || 'Failed to delete category');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    if (allCategories.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="folder-outline" size={48} color="#CCCCCC" />
                <Text style={styles.emptyTitle}>No Categories</Text>
                <Text style={styles.emptyDescription}>
                    Create your first category to organize your products
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={rootCategories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CategoryItemContainer
                        category={item}
                        level={0}
                        onEdit={onEdit}
                        onDelete={handleDelete}
                        onManageProducts={onManageProducts}
                    />
                )}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginVertical: 2,
        borderRadius: 8,
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 1,
    },
    categoryInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    expandButton: {
        marginRight: 8,
        padding: 4,
    },
    categoryDetails: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333333',
        fontFamily: 'Inter',
    },
    categoryDescription: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        marginTop: 2,
    },
    categoryActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: 8,
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333333',
        fontFamily: 'Poppins',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 16,
        color: '#666666',
        fontFamily: 'Inter',
        textAlign: 'center',
        lineHeight: 22,
    },
});