import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DashboardMetrics } from '@/components/admin/DashboardMetrics';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';

export default function AdminHome() {
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

    const handleCardPress = (cardType: 'orders' | 'revenue' | 'users' | 'products') => {
        switch (cardType) {
            case 'orders':
                router.push('/(admin)/orders');
                break;
            case 'users':
                router.push('/(admin)/users');
                break;
            case 'products':
                router.push('/(admin)/products');
                break;
            case 'revenue':
                setActiveTab('analytics');
                break;
        }
    };

    return (
        <AdminLayout title="Dashboard">
            <View style={styles.container}>
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeTitle}>Welcome to Admin Dashboard</Text>
                    <Text style={styles.welcomeText}>
                        Manage your e-commerce store from this central hub.
                    </Text>
                </View>

                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
                        onPress={() => setActiveTab('overview')}
                    >
                        <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                            Overview
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
                        onPress={() => setActiveTab('analytics')}
                    >
                        <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
                            Analytics
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                {activeTab === 'overview' ? (
                    <DashboardMetrics onCardPress={handleCardPress} />
                ) : (
                    <AnalyticsDashboard />
                )}
            </View>
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    welcomeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000000',
        fontFamily: 'Poppins',
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 16,
        color: '#666666',
        fontFamily: 'Inter',
        lineHeight: 22,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 4,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 1,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666666',
        fontFamily: 'Inter',
    },
    activeTabText: {
        color: '#000000',
        fontWeight: '600',
    },
});
