import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  IconButton, 
  Badge,
  Pressable,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Address } from '../../services/userService';
import { spacing, fontSizes } from '../../utils/responsive';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  const { colors } = useTheme();

  const handleDelete = () => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete(address.id),
        },
      ]
    );
  };

  const handleSetDefault = () => {
    if (!address.isDefault) {
      onSetDefault(address.id);
    }
  };

  return (
    <Box
      bg={colors.card}
      borderRadius="md"
      borderWidth={1}
      borderColor={colors.border}
      p={spacing.md}
      mb={spacing.sm}
    >
      <VStack space={spacing.sm}>
        <HStack justifyContent="space-between" alignItems="flex-start">
          <VStack flex={1} space={spacing.xs}>
            <HStack alignItems="center" space={spacing.sm}>
              <Badge
                colorScheme={address.type === 'shipping' ? 'blue' : 'green'}
                variant="subtle"
              >
                {address.type.toUpperCase()}
              </Badge>
              {address.isDefault && (
                <Badge colorScheme="orange" variant="subtle">
                  DEFAULT
                </Badge>
              )}
            </HStack>
            
            <Text 
              fontSize={fontSizes.md} 
              fontWeight="600" 
              color={colors.text}
            >
              {address.firstName} {address.lastName}
            </Text>
            
            <Text fontSize={fontSizes.sm} color={colors.textSecondary}>
              {address.phone}
            </Text>
            
            <Text fontSize={fontSizes.sm} color={colors.textSecondary}>
              {address.street}
            </Text>
            
            <Text fontSize={fontSizes.sm} color={colors.textSecondary}>
              {address.city}, {address.state} {address.zipCode}
            </Text>
            
            <Text fontSize={fontSizes.sm} color={colors.textSecondary}>
              {address.country}
            </Text>
          </VStack>
          
          <HStack space={spacing.xs}>
            <IconButton
              icon={<Ionicons name="pencil" size={18} color={colors.primary} />}
              onPress={() => onEdit(address)}
              variant="ghost"
              size="sm"
            />
            <IconButton
              icon={<Ionicons name="trash" size={18} color={colors.error} />}
              onPress={handleDelete}
              variant="ghost"
              size="sm"
            />
          </HStack>
        </HStack>
        
        {!address.isDefault && (
          <Pressable onPress={handleSetDefault}>
            <Text 
              fontSize={fontSizes.sm} 
              color={colors.primary}
              textAlign="center"
              py={spacing.xs}
            >
              Set as Default
            </Text>
          </Pressable>
        )}
      </VStack>
    </Box>
  );
};

export default AddressCard;