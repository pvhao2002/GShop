import React from 'react';
import { Badge } from 'native-base';

interface UserStatusBadgeProps {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'SUSPENDED':
        return 'error';
      default:
        return 'gray';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'INACTIVE':
        return 'Inactive';
      case 'SUSPENDED':
        return 'Suspended';
      default:
        return status;
    }
  };

  return (
    <Badge colorScheme={getStatusColor()} variant="solid" rounded="md">
      {getStatusText()}
    </Badge>
  );
};