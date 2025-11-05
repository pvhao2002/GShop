import React from 'react';
import { Box, VStack, HStack, Text, Pressable, Divider } from 'native-base';

interface Column {
  key: string;
  title: string | React.ReactNode;
  width?: string;
  render?: (item: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onRowPress?: (item: any) => void;
  keyExtractor: (item: any) => string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onRowPress,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold,
  refreshing,
  onRefresh
}) => {
  return (
    <Box bg="white" rounded="lg" shadow={2}>
      {/* Header */}
      <HStack bg="gray.100" p={3} roundedTop="lg" alignItems="center">
        {columns.map((column) => (
          <Box
            key={column.key}
            flex={column.width ? undefined : 1}
            width={column.width}
          >
            {typeof column.title === 'string' ? (
              <Text
                fontSize="sm"
                fontWeight="bold"
                color="gray.700"
              >
                {column.title}
              </Text>
            ) : (
              column.title
            )}
          </Box>
        ))}
      </HStack>
      
      <Divider />
      
      {/* Data Rows */}
      <VStack space={0}>
        {data.map((item, index) => (
          <React.Fragment key={keyExtractor(item)}>
            <Pressable
              onPress={() => onRowPress?.(item)}
              _pressed={{ bg: 'gray.50' }}
            >
              <HStack p={3} alignItems="center">
                {columns.map((column) => (
                  <Box
                    key={column.key}
                    flex={column.width ? undefined : 1}
                    width={column.width}
                  >
                    {column.render ? (
                      column.render(item)
                    ) : (
                      <Text
                        fontSize="sm"
                        color="gray.800"
                        numberOfLines={1}
                      >
                        {item[column.key]}
                      </Text>
                    )}
                  </Box>
                ))}
              </HStack>
            </Pressable>
            {index < data.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </VStack>
      
      {data.length === 0 && (
        <Box p={8} alignItems="center">
          <Text color="gray.500" fontSize="md">
            No data available
          </Text>
        </Box>
      )}
    </Box>
  );
};