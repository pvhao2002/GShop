import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, Category } from '../../services/productService';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  relatedProducts: Product[];
  categories: Category[];
  favorites: string[];
  searchQuery: string;
  selectedCategory: string | null;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  relatedProducts: [],
  categories: [],
  favorites: [],
  searchQuery: '',
  selectedCategory: null,
  currentPage: 0,
  totalPages: 0,
  hasNextPage: false,
  isLoading: false,
  isLoadingMore: false,
  error: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.currentPage = 0;
    },
    appendProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = [...state.products, ...action.payload];
    },
    setProductsPagination: (state, action: PayloadAction<{
      products: Product[];
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      append?: boolean;
    }>) => {
      const { products, currentPage, totalPages, hasNextPage, append = false } = action.payload;
      state.products = append ? [...state.products, ...products] : products;
      state.currentPage = currentPage;
      state.totalPages = totalPages;
      state.hasNextPage = hasNextPage;
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setRelatedProducts: (state, action: PayloadAction<Product[]>) => {
      state.relatedProducts = action.payload;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    addToFavorites: (state, action: PayloadAction<string>) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(id => id !== action.payload);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLoadingMore: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMore = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearProducts: (state) => {
      state.products = [];
      state.currentPage = 0;
      state.totalPages = 0;
      state.hasNextPage = false;
    },
  },
});

export const {
  setProducts,
  appendProducts,
  setProductsPagination,
  setSelectedProduct,
  setRelatedProducts,
  setCategories,
  addToFavorites,
  removeFromFavorites,
  setSearchQuery,
  setSelectedCategory,
  setLoading,
  setLoadingMore,
  setError,
  clearProducts,
} = productSlice.actions;

export default productSlice.reducer;