import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout, logoutStart } from '../store/slices/authSlice';
import { clearUserData } from '../store/slices/userSlice';
import authService from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    dispatch(logoutStart());
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth state
      dispatch(logout());
      
      // Clear user data
      dispatch(clearUserData());
      
      // Clear any other app state that should be reset on logout
      // You can add more state clearing here as needed
    }
  };

  return {
    ...authState,
    logout: handleLogout,
  };
};