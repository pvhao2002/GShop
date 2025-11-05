import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { loginSuccess, logout } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import { useOrderNotifications } from '../../hooks/useOrderNotifications';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Initialize order notifications
  useOrderNotifications();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const authData = await authService.initializeAuth();
      
      if (authData) {
        dispatch(loginSuccess(authData));
      } else {
        dispatch(logout());
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      dispatch(logout());
    } finally {
      setIsInitializing(false);
    }
  };

  if (isInitializing) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;