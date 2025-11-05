import React from 'react';
import {
  ScrollView,
  HStack,
  Pressable,
  Text,
  Box,
} from 'native-base';
import { Category } from '../../services/productService';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <Box px={4} py={2}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <HStack space={2} alignItems="center">
          {/* All Categories Option */}
          <Pressable onPress={() => onSelectCategory(null)} _pressed={{ opacity: 0.8 }}>
            <Box
              px={4}
              py={2}
              rounded="full"
              bg={selectedCategoryId === null ? 'primary.500' : 'gray.100'}
            >
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={selectedCategoryId === null ? 'white' : 'gray.700'}
              >
                All
              </Text>
            </Box>
          </Pressable>

          {/* Category Options */}
          {categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => onSelectCategory(category.id)}
              _pressed={{ opacity: 0.8 }}
            >
              <Box
                px={4}
                py={2}
                rounded="full"
                bg={selectedCategoryId === category.id ? 'primary.500' : 'gray.100'}
              >
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={selectedCategoryId === category.id ? 'white' : 'gray.700'}
                >
                  {category.name}
                </Text>
              </Box>
            </Pressable>
          ))}
        </HStack>
      </ScrollView>
    </Box>
  );
};

export default CategoryFilter;