import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import orderService, { Order, OrdersResponse, OrderFilters } from '../../services/orderService';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  filters: OrderFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
  trackingInfo: {
    trackingNumber?: string;
    status: string;
    estimatedDelivery?: string;
    trackingHistory: Array<{
      status: string;
      timestamp: string;
      location?: string;
      description: string;
    }>;
  } | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  },
  trackingInfo: null,
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (filters: OrderFilters = {}) => {
    const response = await orderService.getOrders(filters);
    return response;
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId: string) => {
    const response = await orderService.getOrderById(orderId);
    return response;
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, reason }: { orderId: string; reason?: string }) => {
    const response = await orderService.cancelOrder(orderId, reason);
    return { orderId, ...response };
  }
);

export const trackOrder = createAsyncThunk(
  'orders/trackOrder',
  async (orderId: string) => {
    const response = await orderService.trackOrder(orderId);
    return response;
  }
);

export const requestSupport = createAsyncThunk(
  'orders/requestSupport',
  async ({ orderId, message, contactMethod }: { 
    orderId: string; 
    message: string; 
    contactMethod: 'email' | 'phone' 
  }) => {
    const response = await orderService.requestSupport(orderId, message, contactMethod);
    return response;
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<OrderFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearTrackingInfo: (state) => {
      state.trackingInfo = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order['status'] }>) => {
      const { orderId, status } = action.payload;
      
      // Update in orders list
      const orderIndex = state.orders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        state.orders[orderIndex].status = status;
      }
      
      // Update current order if it matches
      if (state.currentOrder && state.currentOrder.id === orderId) {
        state.currentOrder.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch order details';
      })
      
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const { orderId } = action.payload;
        
        // Update order status to CANCELED
        const orderIndex = state.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = 'CANCELED';
        }
        
        if (state.currentOrder && state.currentOrder.id === orderId) {
          state.currentOrder.status = 'CANCELED';
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to cancel order';
      })
      
      // Track order
      .addCase(trackOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.trackingInfo = action.payload;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tracking information';
      })
      
      // Request support
      .addCase(requestSupport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestSupport.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestSupport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to submit support request';
      });
  },
});

export const { 
  setFilters, 
  clearCurrentOrder, 
  clearTrackingInfo, 
  clearError,
  updateOrderStatus 
} = orderSlice.actions;

export default orderSlice.reducer;