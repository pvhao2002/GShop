import React from 'react';
import { Button, IButtonProps } from 'native-base';

interface CustomButtonProps extends IButtonProps {
  title: string;
  loading?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  loading = false, 
  ...props 
}) => {
  return (
    <Button
      isLoading={loading}
      isLoadingText="Loading..."
      {...props}
    >
      {title}
    </Button>
  );
};