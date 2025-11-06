import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface NavigationItem {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
    badge?: number;
}

const navigationItems: NavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        icon: 'grid-outline',
        route: '/(admin)',
    },
    {
        id: 'products',
        title: 'Products',
        icon: 'shirt-outline',
        route: '/(admin)/products',
    },
    {
        id: 'orders',
        title: 'Orders',
        icon: 'receipt-outline',
        route: '/(admin)/orders',
    },
    {
        id: 'users',
        title: 'Users',
        icon: 'people-outline',
        route: '/(admin)/users',
    },
    {
        id: 'categories',
        title: 'Categories',
        icon: 'folder-outline',
        route: '/(admin)/categories',
    },
];

interface AdminNavigationProps {
    isVisible: boolean;
    onClose: () => void;
}

export function AdminNavigation({ isVisible, onClose }: AdminNavigationProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleNavigate = (route: string) => {
        router.push(route as any);
        onClose();
    };

    const isActiveRoute = (route: string) => {
        if (route === '/(admin)') {
            return pathname === '/(admin)' || pathname === '/';
        }
        return pathname.startsWith(route);
    };

    if (!isVisible) return null;

    return (
        <View style={styles.overlay}>
            <TouchableOpacity style={styles.backdrop} onPress={onClose} />
            <View style={styles.sidebar}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Admin Panel</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color="#666666" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.navigation}>
                    {navigationItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.navItem,
                                isActiveRoute(item.route) && styles.navItemActive,
                            ]}
                            onPress={() => handleNavigate(item.route)}
                        >
                            <Ionicons
                                name={item.icon}
                                size={20}
                                color={isActiveRoute(item.route) ? '#4A5D23' : '#666666'}
                            />
                            <Text
                                style={[
                                    styles.navItemText,
                                    isActiveRoute(item.route) && styles.navItemTextActive,
                                ]}
                            >
                                {item.title}
                            </Text>
                            {item.badge && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{item.badge}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>FASHIONLY Admin v1.0</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 280,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 2, height: 0 },
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000000',
        fontFamily: 'Poppins',
    },
    closeButton: {
        padding: 4,
    },
    navigation: {
        flex: 1,
        paddingTop: 16,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginHorizontal: 12,
        borderRadius: 8,
    },
    navItemActive: {
        backgroundColor: '#E8F5E8',
    },
    navItemText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#666666',
        fontWeight: '500',
        fontFamily: 'Inter',
        flex: 1,
    },
    navItemTextActive: {
        color: '#4A5D23',
        fontWeight: '600',
    },
    badge: {
        backgroundColor: '#D32F2F',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
    },
    footerText: {
        fontSize: 12,
        color: '#999999',
        textAlign: 'center',
        fontFamily: 'Inter',
    },
});