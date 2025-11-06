import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminOrders() {
    return (
        <AdminLayout title="Orders">
            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.title}>Order Management</Text>
                    <Text style={styles.description}>
                        This screen will contain order management functionality including:
                    </Text>
                    <Text style={styles.listItem}>• View all customer orders</Text>
                    <Text style={styles.listItem}>• Update order status</Text>
                    <Text style={styles.listItem}>• Process order fulfillment</Text>
                    <Text style={styles.listItem}>• View order details</Text>
                    <Text style={styles.listItem}>• Generate order reports</Text>
                </View>
            </View>
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Poppins',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#666666',
        fontFamily: 'Inter',
        marginBottom: 16,
        lineHeight: 22,
    },
    listItem: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter',
        marginBottom: 8,
        lineHeight: 20,
    },
});