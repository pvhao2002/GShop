import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  VStack,
  HStack,
  ScrollView,
  Heading,
  Text,
  Button,
  IconButton,
  Fab,
  Modal,
  useDisclose,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import ThemedSafeAreaView from '../../components/common/ThemedSafeAreaView';
import { AddressCard, AddressForm } from '../../components/profile';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../hooks/useProfile';
import { spacing, fontSizes } from '../../utils/responsive';
import { Address, CreateAddressRequest } from '../../services/userService';

const AddressManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { 
    addresses, 
    isLoading, 
    loadAddresses, 
    createAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress 
  } = useProfile();
  
  const { isOpen, onOpen, onClose } = useDisclose();
  const [editingAddress, setEditingAddress] = useState<Address | undefined>();

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleAddAddress = () => {
    setEditingAddress(undefined);
    onOpen();
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    onOpen();
  };

  const handleSubmitAddress = async (data: CreateAddressRequest) => {
    let success = false;
    
    if (editingAddress) {
      success = await updateAddress(editingAddress.id, data);
    } else {
      success = await createAddress(data);
    }
    
    if (success) {
      onClose();
      setEditingAddress(undefined);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    await deleteAddress(id);
  };

  const handleSetDefaultAddress = async (id: string) => {
    await setDefaultAddress(id);
  };

  const handleCancel = () => {
    onClose();
    setEditingAddress(undefined);
  };

  const shippingAddresses = addresses.filter(addr => addr.type === 'shipping');
  const billingAddresses = addresses.filter(addr => addr.type === 'billing');

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ScrollView flex={1} bg={colors.background}>
        <VStack space={spacing.lg} p={spacing.md}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center">
            <Heading size="lg" color={colors.text}>Address Management</Heading>
            <IconButton
              icon={<Ionicons name="close" size={24} color={colors.text} />}
              onPress={() => navigation.goBack()}
            />
          </HStack>

          {/* Shipping Addresses */}
          <VStack space={spacing.md}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize={fontSizes.lg} fontWeight="600" color={colors.text}>
                Shipping Addresses
              </Text>
              <Text fontSize={fontSizes.sm} color={colors.textSecondary}>
                {shippingAddresses.length} address{shippingAddresses.length !== 1 ? 'es' : ''}
              </Text>
            </HStack>
            
            {shippingAddresses.length > 0 ? (
              <VStack space={spacing.sm}>
                {shippingAddresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={handleEditAddress}
                    onDelete={handleDeleteAddress}
                    onSetDefault={handleSetDefaultAddress}
                  />
                ))}
              </VStack>
            ) : (
              <VStack 
                alignItems="center" 
                justifyContent="center" 
                py={spacing.xl}
                bg={colors.surface}
                borderRadius="md"
              >
                <Ionicons name="location-outline" size={48} color={colors.textSecondary} />
                <Text fontSize={fontSizes.md} color={colors.textSecondary} textAlign="center">
                  No shipping addresses added yet
                </Text>
                <Button
                  variant="ghost"
                  onPress={handleAddAddress}
                  mt={spacing.sm}
                >
                  Add Shipping Address
                </Button>
              </VStack>
            )}
          </VStack>

          {/* Billing Addresses */}
          <VStack space={spacing.md}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize={fontSizes.lg} fontWeight="600" color={colors.text}>
                Billing Addresses
              </Text>
              <Text fontSize={fontSizes.sm} color={colors.textSecondary}>
                {billingAddresses.length} address{billingAddresses.length !== 1 ? 'es' : ''}
              </Text>
            </HStack>
            
            {billingAddresses.length > 0 ? (
              <VStack space={spacing.sm}>
                {billingAddresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={handleEditAddress}
                    onDelete={handleDeleteAddress}
                    onSetDefault={handleSetDefaultAddress}
                  />
                ))}
              </VStack>
            ) : (
              <VStack 
                alignItems="center" 
                justifyContent="center" 
                py={spacing.xl}
                bg={colors.surface}
                borderRadius="md"
              >
                <Ionicons name="card-outline" size={48} color={colors.textSecondary} />
                <Text fontSize={fontSizes.md} color={colors.textSecondary} textAlign="center">
                  No billing addresses added yet
                </Text>
                <Button
                  variant="ghost"
                  onPress={handleAddAddress}
                  mt={spacing.sm}
                >
                  Add Billing Address
                </Button>
              </VStack>
            )}
          </VStack>
        </VStack>
      </ScrollView>

      {/* Add Address FAB */}
      <Fab
        renderInPortal={false}
        shadow={2}
        size="sm"
        icon={<Ionicons name="add" size={24} color="white" />}
        onPress={handleAddAddress}
        bg={colors.primary}
      />

      {/* Address Form Modal */}
      <Modal isOpen={isOpen} onClose={handleCancel} size="full">
        <Modal.Content>
          <Modal.Header>
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </Modal.Header>
          <Modal.Body p={0}>
            <AddressForm
              address={editingAddress}
              onSubmit={handleSubmitAddress}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AddressManagementScreen;