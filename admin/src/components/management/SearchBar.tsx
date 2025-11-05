import React from 'react';
import { Input, InputGroup, InputLeftAddon } from 'native-base';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText
}) => {
  return (
    <InputGroup w="100%" mb={4}>
      <InputLeftAddon>
        <Ionicons name="search" size={20} color="gray" />
      </InputLeftAddon>
      <Input
        flex={1}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        variant="outline"
      />
    </InputGroup>
  );
};