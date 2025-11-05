import React from 'react';
import { Badge } from 'native-base';

interface UserRoleBadgeProps {
  role: 'ROLE_USER' | 'ROLE_ADMIN';
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  const getRoleColor = () => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'purple';
      case 'ROLE_USER':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getRoleText = () => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'Admin';
      case 'ROLE_USER':
        return 'Customer';
      default:
        return role;
    }
  };

  return (
    <Badge colorScheme={getRoleColor()} variant="solid" rounded="md">
      {getRoleText()}
    </Badge>
  );
};