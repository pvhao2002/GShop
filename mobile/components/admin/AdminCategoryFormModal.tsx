
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '@/types';
import { AdminCategoryForm } from './AdminCategoryForm';

interface AdminCategoryFormModalProps {
    visible: boolean;
    category?: Category | undefined;
    onSave: () => void;
    onCancel: () => void;
}

export function AdminCategoryFormModal({
    visible,
    category,
    onSave,
    onCancel,
}: AdminCategoryFormModalProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onCancel}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#333333" />
                    </TouchableOpacity>
                </View>
                
                <AdminCategoryForm
                    category={category}
                    onSave={onSave}
                    onCancel={onCancel}
                />
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
    },
    closeButton: {
        padding: 8,
    },
});