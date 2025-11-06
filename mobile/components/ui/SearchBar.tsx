import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: (text: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  containerStyle?: any;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search products...',
  value,
  onChangeText,
  onSearch,
  onClear,
  debounceMs = 300,
  containerStyle,
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search effect
  useEffect(() => {
    if (!onSearch || !value.trim()) return;

    const timeoutId = setTimeout(() => {
      onSearch(value.trim());
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [value, onSearch, debounceMs]);

  const handleClear = () => {
    onChangeText('');
    if (onClear) {
      onClear();
    }
  };

  const handleSearch = () => {
    if (onSearch && value.trim()) {
      onSearch(value.trim());
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[
        styles.searchContainer,
        isFocused && styles.searchContainerFocused,
      ]}>
        <Ionicons
          name="search"
          size={20}
          color="#666666"
          style={styles.searchIcon}
        />
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color="#666666"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// const { width } = Dimensions.get('window'); // Unused for now

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchContainerFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    fontFamily: 'Inter',
    paddingVertical: 12,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
});