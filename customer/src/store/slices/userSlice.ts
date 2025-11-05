import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Address, NotificationPreferences } from '../../services/userService';

interface UserState {
  profile: User | null;
  addresses: Address[];
  notificationPreferences: NotificationPreferences | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  addresses: [],
  notificationPreferences: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Profile actions
    setProfile: (state, action: PayloadAction<User>) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    
    // Address actions
    setAddresses: (state, action: PayloadAction<Address[]>) => {
      state.addresses = action.payload;
    },
    addAddress: (state, action: PayloadAction<Address>) => {
      state.addresses.push(action.payload);
    },
    updateAddress: (state, action: PayloadAction<{ id: string; data: Partial<Address> }>) => {
      const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
      if (index !== -1) {
        state.addresses[index] = { ...state.addresses[index], ...action.payload.data };
      }
    },
    removeAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
    },
    setDefaultAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === action.payload,
      }));
    },
    
    // Notification preferences
    setNotificationPreferences: (state, action: PayloadAction<NotificationPreferences>) => {
      state.notificationPreferences = action.payload;
    },
    updateNotificationPreferences: (state, action: PayloadAction<Partial<NotificationPreferences>>) => {
      if (state.notificationPreferences) {
        state.notificationPreferences = { ...state.notificationPreferences, ...action.payload };
      }
    },
    
    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear all user data (for logout)
    clearUserData: (state) => {
      state.profile = null;
      state.addresses = [];
      state.notificationPreferences = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setProfile,
  updateProfile,
  setAddresses,
  addAddress,
  updateAddress,
  removeAddress,
  setDefaultAddress,
  setNotificationPreferences,
  updateNotificationPreferences,
  setLoading,
  setError,
  clearError,
  clearUserData,
} = userSlice.actions;

export default userSlice.reducer;