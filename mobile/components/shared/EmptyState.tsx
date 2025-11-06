import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description
}) => {
    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={64} color="#CCCCCC" />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666666',
        fontFamily: 'Poppins',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#999999',
        fontFamily: 'Inter',
        textAlign: 'center',
        lineHeight: 20,
    },
});