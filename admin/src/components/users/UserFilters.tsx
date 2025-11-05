import React from 'react';
import { HStack, Select, CheckIcon } from 'native-base';

interface UserFiltersProps {
  selectedRole: string;
  selectedStatus: string;
  onRoleChange: (role: string) => void;
  onStatusChange: (status: string) => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  selectedRole,
  selectedStatus,
  onRoleChange,
  onStatusChange,
}) => {
  return (
    <HStack space={3} alignItems="center">
      <Select
        selectedValue={selectedRole}
        minWidth="120"
        accessibilityLabel="Filter by role"
        placeholder="All Roles"
        _selectedItem={{
          bg: "blue.500",
          endIcon: <CheckIcon size="5" />
        }}
        onValueChange={onRoleChange}
      >
        <Select.Item label="All Roles" value="" />
        <Select.Item label="Customers" value="ROLE_USER" />
        <Select.Item label="Admins" value="ROLE_ADMIN" />
      </Select>

      <Select
        selectedValue={selectedStatus}
        minWidth="120"
        accessibilityLabel="Filter by status"
        placeholder="All Status"
        _selectedItem={{
          bg: "blue.500",
          endIcon: <CheckIcon size="5" />
        }}
        onValueChange={onStatusChange}
      >
        <Select.Item label="All Status" value="" />
        <Select.Item label="Active" value="ACTIVE" />
        <Select.Item label="Inactive" value="INACTIVE" />
        <Select.Item label="Suspended" value="SUSPENDED" />
      </Select>
    </HStack>
  );
};