import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '@/types';
import { SearchBar } from '@/components/ui/SearchBar';

interface FilterOptions {
    search: string;
    categoryId: string | null;
    isActive: boolean | null;
    sortBy: 'name' | 'price' | 'createdAt';
    sortOrder: 'asc' | 'desc';
}

interface AdminProductFiltersProps {
    filters: FilterOptions;
    categories: Category[];
    onFiltersChange: (filters: FilterOptions) => void;
    onClearFilters: () => void;
    productCount: number;
}

export const AdminProductFilters: React.FC<AdminProductFiltersProps> = ({
    filters,
    categories,
    onFiltersChange,
    onClearFilters,
    productCount
}) => {
    const [showFilters, setShowFilters] = useState(false);

    const handleSearchChange = (search: string) => {
        onFiltersChange({ ...filters, search });
    };

    const handleCategoryChange = (categoryId: string | null) => {
        onFiltersChange({ ...filters, categoryId });
    };

    const handleStatusChange = (isActive: boolean | null) => {
        onFiltersChange({ ...filters, isActive });
    };

    const handleSortChange = (sortBy: FilterOptions['sortBy'], sortOrder: FilterOptions['sortOrder']) => {
        onFiltersChange({ ...filters, sortBy, sortOrder });
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.categoryId) count++;
        if (filters.isActive !== null) count++;
        return count;
    };

    const getSortLabel = () => {
        const sortLabels = {
            name: 'Name',
            price: 'Price',
            createdAt: 'Date Created'
        };
        const orderLabel = filters.sortOrder === 'asc' ? '↑' : '↓';
        return `${sortLabels[filters.sortBy]} ${orderLabel}`;
    };

    const getSelectedCategory = () => {
        if (!filters.categoryId) return null;
        return categories.find(cat => cat.id === filters.categoryId);
    };

    const getStatusLabel = () => {
        if (filters.isActive === null) return 'All Status';
        return filters.isActive ? 'Active Only' : 'Inactive Only';
    };

    return (
        <View style={styles.container}>
            <SearchBar
                value={filters.search}
                onChangeText={handleSearchChange}
                placeholder="Search products..."
                style={styles.searchBar}
            />

            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowFilters(true)}
                >
                    <Ionicons name="filter-outline" size={16} color="#000000" />
                    <Text style={styles.filterButtonText}>Filters</Text>
                    {getActiveFiltersCount() > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.resultInfo}>
                    <Text style={styles.resultText}>{productCount} products</Text>
                </View>
            </View>

            {getActiveFiltersCount() > 0 && (
                <View style={styles.activeFilters}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {filters.search && (
                            <View style={styles.activeFilterChip}>
                                <Text style={styles.activeFilterText}>Search: {filters.search}</Text>
                                <TouchableOpacity onPress={() => handleSearchChange('')}>
                                    <Ionicons name="close" size={14} color="#666666" />
                                </TouchableOpacity>
                            </View>
                        )}
                        
                        {filters.categoryId && (
                            <View style={styles.activeFilterChip}>
                                <Text style={styles.activeFilterText}>
                                    Category: {getSelectedCategory()?.name}
                                </Text>
                                <TouchableOpacity onPress={() => handleCategoryChange(null)}>
                                    <Ionicons name="close" size={14} color="#666666" />
                                </TouchableOpacity>
                            </View>
                        )}
                        
                        {filters.isActive !== null && (
                            <View style={styles.activeFilterChip}>
                                <Text style={styles.activeFilterText}>
                                    Status: {filters.isActive ? 'Active' : 'Inactive'}
                                </Text>
                                <TouchableOpacity onPress={() => handleStatusChange(null)}>
                                    <Ionicons name="close" size={14} color="#666666" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                    
                    <TouchableOpacity style={styles.clearFiltersButton} onPress={onClearFilters}>
                        <Text style={styles.clearFiltersText}>Clear All</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal
                visible={showFilters}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filter Products</Text>
                        <TouchableOpacity onPress={() => setShowFilters(false)}>
                            <Ionicons name="close" size={24} color="#000000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* Category Filter */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Category</Text>
                            <TouchableOpacity
                                style={[
                                    styles.filterOption,
                                    filters.categoryId === null && styles.selectedFilterOption
                                ]}
                                onPress={() => handleCategoryChange(null)}
                            >
                                <Text style={[
                                    styles.filterOptionText,
                                    filters.categoryId === null && styles.selectedFilterOptionText
                                ]}>
                                    All Categories
                                </Text>
                            </TouchableOpacity>
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.filterOption,
                                        filters.categoryId === category.id && styles.selectedFilterOption
                                    ]}
                                    onPress={() => handleCategoryChange(category.id)}
                                >
                                    <Text style={[
                                        styles.filterOptionText,
                                        filters.categoryId === category.id && styles.selectedFilterOptionText
                                    ]}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Status Filter */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Status</Text>
                            {[
                                { label: 'All Status', value: null },
                                { label: 'Active Only', value: true },
                                { label: 'Inactive Only', value: false }
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.label}
                                    style={[
                                        styles.filterOption,
                                        filters.isActive === option.value && styles.selectedFilterOption
                                    ]}
                                    onPress={() => handleStatusChange(option.value)}
                                >
                                    <Text style={[
                                        styles.filterOptionText,
                                        filters.isActive === option.value && styles.selectedFilterOptionText
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Sort Options */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Sort By</Text>
                            {[
                                { label: 'Name (A-Z)', sortBy: 'name' as const, sortOrder: 'asc' as const },
                                { label: 'Name (Z-A)', sortBy: 'name' as const, sortOrder: 'desc' as const },
                                { label: 'Price (Low to High)', sortBy: 'price' as const, sortOrder: 'asc' as const },
                                { label: 'Price (High to Low)', sortBy: 'price' as const, sortOrder: 'desc' as const },
                                { label: 'Newest First', sortBy: 'createdAt' as const, sortOrder: 'desc' as const },
                                { label: 'Oldest First', sortBy: 'createdAt' as const, sortOrder: 'asc' as const }
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.label}
                                    style={[
                                        styles.filterOption,
                                        filters.sortBy === option.sortBy && 
                                        filters.sortOrder === option.sortOrder && 
                                        styles.selectedFilterOption
                                    ]}
                                    onPress={() => handleSortChange(option.sortBy, option.sortOrder)}
                                >
                                    <Text style={[
                                        styles.filterOptionText,
                                        filters.sortBy === option.sortBy && 
                                        filters.sortOrder === option.sortOrder && 
                                        styles.selectedFilterOptionText
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={() => {
                                onClearFilters();
                                setShowFilters(false);
                            }}
                        >
                            <Text style={styles.clearButtonText}>Clear All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => setShowFilters(false)}
                        >
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingTop: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    searchBar: {
        marginBottom: 12,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    filterButtonText: {
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Inter',
        marginLeft: 6,
    },
    filterBadge: {
        backgroundColor: '#000000',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
    },
    filterBadgeText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    resultInfo: {
        alignItems: 'flex-end',
    },
    resultText: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Inter',
    },
    activeFilters: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    activeFilterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
        marginRight: 8,
    },
    activeFilterText: {
        fontSize: 12,
        color: '#333333',
        fontFamily: 'Inter',
        marginRight: 4,
    },
    clearFiltersButton: {
        marginLeft: 'auto',
    },
    clearFiltersText: {
        fontSize: 12,
        color: '#D32F2F',
        fontFamily: 'Inter',
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    filterSection: {
        marginBottom: 24,
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
        marginBottom: 12,
    },
    filterOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#F5F5F5',
    },
    selectedFilterOption: {
        backgroundColor: '#000000',
    },
    filterOptionText: {
        fontSize: 14,
        color: '#333333',
        fontFamily: 'Inter',
    },
    selectedFilterOptionText: {
        color: '#FFFFFF',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
    },
    clearButton: {
        flex: 1,
        paddingVertical: 12,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 8,
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        fontWeight: '500',
    },
    applyButton: {
        flex: 1,
        paddingVertical: 12,
        marginLeft: 8,
        backgroundColor: '#000000',
        borderRadius: 8,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'Inter',
        fontWeight: '500',
    },
});