import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AdminHeader } from './AdminHeader';
import { AdminNavigation } from './AdminNavigation';
import { AdminGuard } from '../shared/AdminGuard';

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
}

export function AdminLayout({ 
    children, 
    title, 
    showBackButton = false, 
    onBackPress 
}: AdminLayoutProps) {
    const [isNavigationVisible, setIsNavigationVisible] = useState(false);

    const toggleNavigation = () => {
        setIsNavigationVisible(!isNavigationVisible);
    };

    const closeNavigation = () => {
        setIsNavigationVisible(false);
    };

    return (
        <AdminGuard>
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={toggleNavigation}
                    >
                        <Ionicons name="menu" size={24} color="#000000" />
                    </TouchableOpacity>
                    
                    <AdminHeader
                        title={title}
                        showBackButton={showBackButton}
                        {...(onBackPress && { onBackPress })}
                    />
                </View>

                <View style={styles.content}>
                    {children}
                </View>

                <AdminNavigation
                    isVisible={isNavigationVisible}
                    onClose={closeNavigation}
                />
            </SafeAreaView>
        </AdminGuard>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    menuButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    content: {
        flex: 1,
    },
});