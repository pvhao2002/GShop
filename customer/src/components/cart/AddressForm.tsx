import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  FormControl,
  Button,
  Checkbox,
  Select,
  CheckIcon,
} from 'native-base';

interface Address {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

interface AddressFormProps {
  title: string;
  address: Address | null;
  onAddressChange: (address: Address) => void;
  showSameAsShipping?: boolean;
  useSameAsShipping?: boolean;
  onUseSameAsShippingChange?: (value: boolean) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  title,
  address,
  onAddressChange,
  showSameAsShipping = false,
  useSameAsShipping = false,
  onUseSameAsShippingChange,
}) => {
  const [formData, setFormData] = useState<Address>(
    address || {
      fullName: '',
      phone: '',
      address: '',
      city: '',
      district: '',
      ward: '',
    }
  );

  const [errors, setErrors] = useState<Partial<Address>>({});

  const cities = [
    'Ho Chi Minh City',
    'Hanoi',
    'Da Nang',
    'Can Tho',
    'Hai Phong',
    'Bien Hoa',
    'Hue',
    'Nha Trang',
    'Buon Ma Thuot',
    'Vung Tau',
  ];

  const validateField = (field: keyof Address, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = 'Full name is required';
        } else {
          delete newErrors.fullName;
        }
        break;
      case 'phone':
        const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
        if (!value.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(value)) {
          newErrors.phone = 'Invalid phone number format';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'address':
        if (!value.trim()) {
          newErrors.address = 'Address is required';
        } else {
          delete newErrors.address;
        }
        break;
      case 'city':
        if (!value.trim()) {
          newErrors.city = 'City is required';
        } else {
          delete newErrors.city;
        }
        break;
      case 'district':
        if (!value.trim()) {
          newErrors.district = 'District is required';
        } else {
          delete newErrors.district;
        }
        break;
      case 'ward':
        if (!value.trim()) {
          newErrors.ward = 'Ward is required';
        } else {
          delete newErrors.ward;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof Address, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    validateField(field, value);
    
    // Update parent component if all fields are valid
    if (validateAllFields(newFormData)) {
      onAddressChange(newFormData);
    }
  };

  const validateAllFields = (data: Address) => {
    const fields: (keyof Address)[] = ['fullName', 'phone', 'address', 'city', 'district', 'ward'];
    return fields.every(field => {
      validateField(field, data[field]);
      return !errors[field] && data[field].trim() !== '';
    });
  };

  if (showSameAsShipping && useSameAsShipping) {
    return (
      <Box bg="white" rounded="lg" shadow={1} p={4}>
        <VStack space={4}>
          <Text fontSize="lg" fontWeight="bold">
            {title}
          </Text>
          
          <Checkbox
            isChecked={useSameAsShipping}
            onChange={onUseSameAsShippingChange}
            value="same"
          >
            <Text fontSize="md">Same as shipping address</Text>
          </Checkbox>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg="white" rounded="lg" shadow={1} p={4}>
      <VStack space={4}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="lg" fontWeight="bold">
            {title}
          </Text>
          
          {showSameAsShipping && (
            <Checkbox
              isChecked={useSameAsShipping}
              onChange={onUseSameAsShippingChange}
              value="same"
            >
              <Text fontSize="sm">Same as shipping</Text>
            </Checkbox>
          )}
        </HStack>

        {/* Full Name */}
        <FormControl isRequired isInvalid={!!errors.fullName}>
          <FormControl.Label>Full Name</FormControl.Label>
          <Input
            placeholder="Enter full name"
            value={formData.fullName}
            onChangeText={(value) => handleFieldChange('fullName', value)}
          />
          <FormControl.ErrorMessage>
            {errors.fullName}
          </FormControl.ErrorMessage>
        </FormControl>

        {/* Phone */}
        <FormControl isRequired isInvalid={!!errors.phone}>
          <FormControl.Label>Phone Number</FormControl.Label>
          <Input
            placeholder="Enter phone number"
            value={formData.phone}
            onChangeText={(value) => handleFieldChange('phone', value)}
            keyboardType="phone-pad"
          />
          <FormControl.ErrorMessage>
            {errors.phone}
          </FormControl.ErrorMessage>
        </FormControl>

        {/* Address */}
        <FormControl isRequired isInvalid={!!errors.address}>
          <FormControl.Label>Street Address</FormControl.Label>
          <Input
            placeholder="Enter street address"
            value={formData.address}
            onChangeText={(value) => handleFieldChange('address', value)}
            multiline
            numberOfLines={2}
          />
          <FormControl.ErrorMessage>
            {errors.address}
          </FormControl.ErrorMessage>
        </FormControl>

        {/* City */}
        <FormControl isRequired isInvalid={!!errors.city}>
          <FormControl.Label>City</FormControl.Label>
          <Select
            selectedValue={formData.city}
            placeholder="Select city"
            onValueChange={(value) => handleFieldChange('city', value)}
            _selectedItem={{
              bg: 'primary.600',
              endIcon: <CheckIcon size="5" />,
            }}
          >
            {cities.map((city) => (
              <Select.Item key={city} label={city} value={city} />
            ))}
          </Select>
          <FormControl.ErrorMessage>
            {errors.city}
          </FormControl.ErrorMessage>
        </FormControl>

        {/* District */}
        <FormControl isRequired isInvalid={!!errors.district}>
          <FormControl.Label>District</FormControl.Label>
          <Input
            placeholder="Enter district"
            value={formData.district}
            onChangeText={(value) => handleFieldChange('district', value)}
          />
          <FormControl.ErrorMessage>
            {errors.district}
          </FormControl.ErrorMessage>
        </FormControl>

        {/* Ward */}
        <FormControl isRequired isInvalid={!!errors.ward}>
          <FormControl.Label>Ward</FormControl.Label>
          <Input
            placeholder="Enter ward"
            value={formData.ward}
            onChangeText={(value) => handleFieldChange('ward', value)}
          />
          <FormControl.ErrorMessage>
            {errors.ward}
          </FormControl.ErrorMessage>
        </FormControl>
      </VStack>
    </Box>
  );
};

export default AddressForm;