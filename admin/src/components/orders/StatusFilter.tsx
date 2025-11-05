import React from 'react';
import { HStack, Button, ScrollView } from 'native-base';

interface StatusFilterProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const ORDER_STATUSES = [
  { value: '', label: 'All Orders' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELED', label: 'Canceled' },
];

export const StatusFilter: React.FC<StatusFilterProps> = ({
  selectedStatus,
  onStatusChange,
}) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <HStack space={2} px={1}>
        {ORDER_STATUSES.map((status) => (
          <Button
            key={status.value}
            size="sm"
            variant={selectedStatus === status.value ? 'solid' : 'outline'}
            colorScheme={selectedStatus === status.value ? 'blue' : 'gray'}
            onPress={() => onStatusChange(status.value)}
            minW="80px"
          >
            {status.label}
          </Button>
        ))}
      </HStack>
    </ScrollView>
  );
};