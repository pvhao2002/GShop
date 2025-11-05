import React, { useState, useEffect } from 'react';
import {
  Input,
  HStack,
  IconButton,
  Box,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  placeholder = 'Search products...',
  autoFocus = false,
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChangeText = (text: string) => {
    setLocalValue(text);
    onChangeText(text);
  };

  const handleSearch = () => {
    onSearch(localValue.trim());
  };

  const handleClear = () => {
    setLocalValue('');
    onChangeText('');
    onSearch('');
  };

  return (
    <Box px={4} py={2}>
      <HStack space={2} alignItems="center">
        <Input
          flex={1}
          placeholder={placeholder}
          value={localValue}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSearch}
          autoFocus={autoFocus}
          returnKeyType="search"
          InputLeftElement={
            <IconButton
              icon={<Ionicons name="search" size={20} color="#666" />}
              onPress={handleSearch}
              size="sm"
            />
          }
          InputRightElement={
            localValue.length > 0 ? (
              <IconButton
                icon={<Ionicons name="close" size={20} color="#666" />}
                onPress={handleClear}
                size="sm"
              />
            ) : undefined
          }
          bg="gray.50"
          borderColor="gray.200"
          _focus={{
            bg: 'white',
            borderColor: 'primary.500',
          }}
        />
      </HStack>
    </Box>
  );
};

export default SearchBar;