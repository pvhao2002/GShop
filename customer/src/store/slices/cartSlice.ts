import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService, CartItem, CheckoutData, OrderSummary } from '../../services/cartService';
import * as SecureStore from 'expo-secure-store';
import { APP_CONFIG } from '../../config/app';

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  isLoading: boolean;
  isSyncing: boolean;
  orderSummary: OrderSummary | null;
  checkoutData: {
    shippingAddress: ShippingAddress | null;
    billingAddress: ShippingAddress | null;
    paymentMethod: 'cod' | 'momo' | 'vnpay' | null;
    notes: string;
    useSameAddress: boolean;
  };
  validationErrors: string[];
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  isLoading: false,
  isSyncing: false,
  orderSummary: null,
  checkoutData: {
    shippingAddress: null,
    billingAddress: null,
    paymentMethod: null,
    notes: '',
    useSameAddress: true,
  },
  validationErrors: [],
};

// Async thunks
export const syncCartWithBackend = createAsyncThunk(
  'cart/syncWithBackend',
  async (_, { getState }) => {
    const state = getState() as { cart: CartState };
    await cartService.syncCart({ items: state.cart.items });
    return state.cart.items;
  }
);

export const loadCartFromBackend = createAsyncThunk(
  'cart/loadFromBackend',
  async () => {
    const items = await cartService.getCart();
    return items;
  }
);

export const validateCartStock = createAsyncThunk(
  'cart/validateStock',
  async (_, { getState }) => {
    const state = getState() as { cart: CartState };
    const validation = await cartService.validateCartStock(state.cart.items);
    return validation;
  }
);

export const createOrderFromCart = createAsyncThunk(
  'cart/createOrder',
  async (_, { getState }) => {
    const state = getState() as { cart: CartState };
    const { items, checkoutData } = state.cart;
    
    if (!checkoutData.shippingAddress || !checkoutData.paymentMethod) {
      throw new Error('Missing required checkout information');
    }

    const orderData: CheckoutData = {
      items,
      shippingAddress: checkoutData.shippingAddress,
      billingAddress: checkoutData.useSameAddress ? checkoutData.shippingAddress : checkoutData.billingAddress!,
      paymentMethod: checkoutData.paymentMethod,
      notes: checkoutData.notes,
    };

    const result = await cartService.createOrder(orderData);
    return result;
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        item => 
          item.productId === action.payload.productId &&
          item.selectedSize === action.payload.selectedSize &&
          item.selectedColor === action.payload.selectedColor
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }

      cartSlice.caseReducers.calculateTotals(state);
      cartSlice.caseReducers.updateOrderSummary(state);
      cartSlice.caseReducers.persistCart(state);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      cartSlice.caseReducers.calculateTotals(state);
      cartSlice.caseReducers.updateOrderSummary(state);
      cartSlice.caseReducers.persistCart(state);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter(item => item.id !== action.payload.id);
        }
      }
      cartSlice.caseReducers.calculateTotals(state);
      cartSlice.caseReducers.updateOrderSummary(state);
      cartSlice.caseReducers.persistCart(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.totalItems = 0;
      state.orderSummary = null;
      state.checkoutData = initialState.checkoutData;
      cartSlice.caseReducers.persistCart(state);
    },
    calculateTotals: (state) => {
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    updateOrderSummary: (state) => {
      state.orderSummary = cartService.calculateOrderSummary(state.items);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },
    setShippingAddress: (state, action: PayloadAction<ShippingAddress>) => {
      state.checkoutData.shippingAddress = action.payload;
      if (state.checkoutData.useSameAddress) {
        state.checkoutData.billingAddress = action.payload;
      }
    },
    setBillingAddress: (state, action: PayloadAction<ShippingAddress>) => {
      state.checkoutData.billingAddress = action.payload;
    },
    setPaymentMethod: (state, action: PayloadAction<'cod' | 'momo' | 'vnpay'>) => {
      state.checkoutData.paymentMethod = action.payload;
    },
    setNotes: (state, action: PayloadAction<string>) => {
      state.checkoutData.notes = action.payload;
    },
    setUseSameAddress: (state, action: PayloadAction<boolean>) => {
      state.checkoutData.useSameAddress = action.payload;
      if (action.payload && state.checkoutData.shippingAddress) {
        state.checkoutData.billingAddress = state.checkoutData.shippingAddress;
      }
    },
    setValidationErrors: (state, action: PayloadAction<string[]>) => {
      state.validationErrors = action.payload;
    },
    loadCartFromStorage: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      cartSlice.caseReducers.calculateTotals(state);
      cartSlice.caseReducers.updateOrderSummary(state);
    },
    persistCart: (state) => {
      // This will be handled by middleware or effect
      SecureStore.setItemAsync(APP_CONFIG.STORAGE_KEYS.CART_DATA, JSON.stringify(state.items));
    },
  },
  extraReducers: (builder) => {
    builder
      // Sync cart with backend
      .addCase(syncCartWithBackend.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(syncCartWithBackend.fulfilled, (state) => {
        state.isSyncing = false;
      })
      .addCase(syncCartWithBackend.rejected, (state) => {
        state.isSyncing = false;
      })
      // Load cart from backend
      .addCase(loadCartFromBackend.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadCartFromBackend.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        cartSlice.caseReducers.calculateTotals(state);
        cartSlice.caseReducers.updateOrderSummary(state);
      })
      .addCase(loadCartFromBackend.rejected, (state) => {
        state.isLoading = false;
      })
      // Validate cart stock
      .addCase(validateCartStock.pending, (state) => {
        state.isLoading = true;
        state.validationErrors = [];
      })
      .addCase(validateCartStock.fulfilled, (state, action) => {
        state.isLoading = false;
        state.validationErrors = action.payload.valid ? [] : action.payload.errors;
      })
      .addCase(validateCartStock.rejected, (state, action) => {
        state.isLoading = false;
        state.validationErrors = [action.error.message || 'Failed to validate cart'];
      })
      // Create order
      .addCase(createOrderFromCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createOrderFromCart.fulfilled, (state) => {
        state.isLoading = false;
        // Cart will be cleared after successful payment
      })
      .addCase(createOrderFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.validationErrors = [action.error.message || 'Failed to create order'];
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  calculateTotals,
  updateOrderSummary,
  setLoading,
  setSyncing,
  setShippingAddress,
  setBillingAddress,
  setPaymentMethod,
  setNotes,
  setUseSameAddress,
  setValidationErrors,
  loadCartFromStorage,
  persistCart,
} = cartSlice.actions;

export default cartSlice.reducer;