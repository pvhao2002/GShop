import React, { useState } from 'react';
import { Box, HStack, Button, Text, Select, CheckIcon } from 'native-base';

export interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

interface DateRangePickerProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  selectedRange,
  onRangeChange,
}) => {
  const predefinedRanges: DateRange[] = [
    {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      label: 'Last 7 days',
    },
    {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      label: 'Last 30 days',
    },
    {
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      label: 'Last 3 months',
    },
    {
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      label: 'This year',
    },
  ];

  return (
    <Box bg="white" rounded="lg" shadow={1} p={4} mb={4}>
      <HStack space={3} alignItems="center" justifyContent="space-between">
        <Text fontSize="md" fontWeight="semibold" color="gray.700">
          Date Range:
        </Text>
        <Box flex={1} maxW="200">
          <Select
            selectedValue={selectedRange.label}
            minWidth="200"
            accessibilityLabel="Choose date range"
            placeholder="Choose date range"
            _selectedItem={{
              bg: 'blue.500',
              endIcon: <CheckIcon size="5" />
            }}
            onValueChange={(itemValue) => {
              const range = predefinedRanges.find(r => r.label === itemValue);
              if (range) {
                onRangeChange(range);
              }
            }}
          >
            {predefinedRanges.map((range) => (
              <Select.Item
                key={range.label}
                label={range.label}
                value={range.label}
              />
            ))}
          </Select>
        </Box>
      </HStack>
      <Text fontSize="xs" color="gray.500" mt={2}>
        {selectedRange.startDate} to {selectedRange.endDate}
      </Text>
    </Box>
  );
};