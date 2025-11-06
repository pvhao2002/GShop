import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AdminProductActionsProps {
    selectedProducts: string[];
    onClearSelection: () => void;
    onBulkDelete: (productIds: string[]) => void;
    onBulkToggleStatus: (productIds: string[], activate: boolean) => void;
    onAddProduct: () => void;
    selectionMode: boolean;
    onToggleSelectionMode: () => void;
}

export const AdminProductActions: React.FC<AdminProductActionsProps> = ({
    selectedProducts,
    onClearSelection,
    onBulkDelete,
    onBulkToggleStatus,
    onAddProduct,
    selectionMode,
    onToggleSelectionMode
}) => {
    const handleBulkDelete = () => {
        Alert.alert(
            'Delete Products',
            `Are you sure you want to delete ${selectedProducts.length} selected products? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: () => {
                        onBulkDelete(selectedProducts);
                        onClearSelection();
                    }
                }
            ]
        );
    };

    const handleBulkActivate = () => {
        Alert.alert(
            'Activate Products',
            `Are you sure you want to activate ${selectedProducts.length} selected products?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Activate', 
                    onPress: () => {
                        onBulkToggleStatus(selectedProducts, true);
                        onClearSelection();
                    }
                }
            ]
        );
    };

    const handleBulkDeactivate = () => {
        Alert.alert(
            'Deactivate Products',
            `Are you sure you want to deactivate ${selectedProducts.length} selected products?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Deactivate', 
                    onPress: () => {
                        onBulkToggleStatus(selectedProducts, false);
                        onClearSelection();
                    }
                }
            ]
        );
    };

    if (selectionMode && selectedProducts.length > 0) {
        return (
            <View style={styles.bulkActionsContainer}>
                <View style={styles.selectionInfo}>
                    <Text style={styles.selectionText}>
                        {selectedProducts.length} selected
                    </Text>
                    <TouchableOpacity onPress={onClearSelection}>
                        <Text style={styles.clearSelectionText}>Clear</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bulkActions}>
                    <TouchableOpacity
                        style={styles.bulkActionButton}
                        onPress={handleBulkActivate}
                    >
                        <Ionicons name="play-outline" size={16} color="#4A5D23" />
                        <Text style={[styles.bulkActionText, { color: '#4A5D23' }]}>
                            Activate
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.bulkActionButton}
                        onPress={handleBulkDeactivate}
                    >
                        <Ionicons name="pause-outline" size={16} color="#666666" />
                        <Text style={styles.bulkActionText}>Deactivate</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.bulkActionButton}
                        onPress={handleBulkDelete}
                    >
                        <Ionicons name="trash-outline" size={16} color="#D32F2F" />
                        <Text style={[styles.bulkActionText, { color: '#D32F2F' }]}>
                            Delete
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.actionsContainer}>
            <TouchableOpacity
                style={styles.actionButton}
                onPress={onToggleSelectionMode}
            >
                <Ionicons 
                    name={selectionMode ? "checkmark-circle-outline" : "ellipsis-horizontal-outline"} 
                    size={20} 
                    color="#666666" 
                />
                <Text style={styles.actionButtonText}>
                    {selectionMode ? 'Done' : 'Select'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={onAddProduct}
            >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                    Add Product
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        backgroundColor: '#FFFFFF',
    },
    primaryButton: {
        backgroundColor: '#000000',
        borderColor: '#000000',
    },
    actionButtonText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        fontWeight: '500',
        marginLeft: 6,
    },
    primaryButtonText: {
        color: '#FFFFFF',
    },
    bulkActionsContainer: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    selectionInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    selectionText: {
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Inter',
        fontWeight: '600',
    },
    clearSelectionText: {
        fontSize: 14,
        color: '#D32F2F',
        fontFamily: 'Inter',
        fontWeight: '500',
    },
    bulkActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    bulkActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8E8E8',
        minWidth: 80,
        justifyContent: 'center',
    },
    bulkActionText: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Inter',
        fontWeight: '500',
        marginLeft: 4,
    },
});