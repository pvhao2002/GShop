import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  VStack,
  HStack,
  FormControl,
  Input,
  Select,
  CheckIcon,
  Button,
  Switch,
  Text,
  ScrollView,
} from 'native-base';
import { useTheme } from '../../context/ThemeContext';
import { Address, CreateAddressRequest } from '../../services/userService';
import { spacing, fontSizes } from '../../utils/responsive';

interface AddressFormProps {
  address?: Address;
  onSubmit: (data: CreateAddressRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { colors } = useTheme();
  
  const [formData, setFormData] = useState<CreateAddressRequest>({
    type: 'shipping',
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Vietnam',
    isDefault: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (address) {
      setFormData({
        type: address.type,
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        isDefault: address.isDefault,
      });
    }
  }, [address]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State/Province is required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP/Postal code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const updateField = (field: keyof CreateAddressRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <ScrollView flex={1} bg={colors.background}>
      <VStack space={spacing.md} p={spacing.md}>
        <FormControl isRequired isInvalid={!!errors.type}>
          <FormControl.Label>Address Type</FormControl.Label>
          <Select
            selectedValue={formData.type}
            onValueChange={(value) => updateField('type', value)}
            _selectedItem={{
              bg: colors.primary,
              endIcon: <CheckIcon size="5" />,
            }}
          >
            <Select.Item label="Shipping Address" value="shipping" />
            <Select.Item label="Billing Address" value="billing" />
          </Select>
          <FormControl.ErrorMessage>{errors.type}</FormControl.ErrorMessage>
        </FormControl>

        <HStack space={spacing.sm}>
          <FormControl flex={1} isRequired isInvalid={!!errors.firstName}>
            <FormControl.Label>First Name</FormControl.Label>
            <Input
              value={formData.firstName}
              onChangeText={(value) => updateField('firstName', value)}
              placeholder="Enter first name"
            />
            <FormControl.ErrorMessage>{errors.firstName}</FormControl.ErrorMessage>
          </FormControl>

          <FormControl flex={1} isRequired isInvalid={!!errors.lastName}>
            <FormControl.Label>Last Name</FormControl.Label>
            <Input
              value={formData.lastName}
              onChangeText={(value) => updateField('lastName', value)}
              placeholder="Enter last name"
            />
            <FormControl.ErrorMessage>{errors.lastName}</FormControl.ErrorMessage>
          </FormControl>
        </HStack>

        <FormControl isRequired isInvalid={!!errors.phone}>
          <FormControl.Label>Phone Number</FormControl.Label>
          <Input
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
          <FormControl.ErrorMessage>{errors.phone}</FormControl.ErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.street}>
          <FormControl.Label>Street Address</FormControl.Label>
          <Input
            value={formData.street}
            onChangeText={(value) => updateField('street', value)}
            placeholder="Enter street address"
            multiline
            numberOfLines={2}
          />
          <FormControl.ErrorMessage>{errors.street}</FormControl.ErrorMessage>
        </FormControl>

        <HStack space={spacing.sm}>
          <FormControl flex={1} isRequired isInvalid={!!errors.city}>
            <FormControl.Label>City</FormControl.Label>
            <Input
              value={formData.city}
              onChangeText={(value) => updateField('city', value)}
              placeholder="Enter city"
            />
            <FormControl.ErrorMessage>{errors.city}</FormControl.ErrorMessage>
          </FormControl>

          <FormControl flex={1} isRequired isInvalid={!!errors.state}>
            <FormControl.Label>State/Province</FormControl.Label>
            <Input
              value={formData.state}
              onChangeText={(value) => updateField('state', value)}
              placeholder="Enter state"
            />
            <FormControl.ErrorMessage>{errors.state}</FormControl.ErrorMessage>
          </FormControl>
        </HStack>

        <HStack space={spacing.sm}>
          <FormControl flex={1} isRequired isInvalid={!!errors.zipCode}>
            <FormControl.Label>ZIP/Postal Code</FormControl.Label>
            <Input
              value={formData.zipCode}
              onChangeText={(value) => updateField('zipCode', value)}
              placeholder="Enter ZIP code"
            />
            <FormControl.ErrorMessage>{errors.zipCode}</FormControl.ErrorMessage>
          </FormControl>

          <FormControl flex={1} isRequired isInvalid={!!errors.country}>
            <FormControl.Label>Country</FormControl.Label>
            <Select
              selectedValue={formData.country}
              onValueChange={(value) => updateField('country', value)}
              _selectedItem={{
                bg: colors.primary,
                endIcon: <CheckIcon size="5" />,
              }}
            >
              <Select.Item label="Vietnam" value="Vietnam" />
              <Select.Item label="United States" value="United States" />
              <Select.Item label="Canada" value="Canada" />
              <Select.Item label="United Kingdom" value="United Kingdom" />
              <Select.Item label="Australia" value="Australia" />
            </Select>
            <FormControl.ErrorMessage>{errors.country}</FormControl.ErrorMessage>
          </FormControl>
        </HStack>

        <HStack alignItems="center" justifyContent="space-between">
          <Text fontSize={fontSizes.md} color={colors.text}>
            Set as default address
          </Text>
          <Switch
            isChecked={formData.isDefault}
            onToggle={(value) => updateField('isDefault', value)}
            colorScheme="primary"
          />
        </HStack>

        <VStack space={spacing.sm} mt={spacing.lg}>
          <Button
            onPress={handleSubmit}
            isLoading={isLoading}
            colorScheme="primary"
          >
            {address ? 'Update Address' : 'Add Address'}
          </Button>
          
          <Button
            variant="outline"
            onPress={onCancel}
            isDisabled={isLoading}
          >
            Cancel
          </Button>
        </VStack>
      </VStack>
    </ScrollView>
  );
};

export default AddressForm;