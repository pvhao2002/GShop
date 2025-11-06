import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Product } from '@/types';
import { AdminProductForm } from './AdminProductForm';

interface AdminProductFormModalProps {
  visible: boolean;
  product?: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

export const AdminProductFormModal: React.FC<AdminProductFormModalProps> = ({
  visible,
  product,
  onSave,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        <AdminProductForm
          product={product}
          onSave={onSave}
          onCancel={onCancel}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});