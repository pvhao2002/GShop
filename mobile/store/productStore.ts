import { create } from 'zustand';
import { Product, Category } from '../types';

interface ProductState {
    products: Product[];
    categories: Category[];
    currentProduct: Product | null;
    searchQuery: string;
    selectedCategory: string | null;
    isLoading: boolean;
    error: string | null;
    
    // Actions
    setProducts: (products: Product[]) => void;
    setCategories: (categories: Category[]) => void;
    setCurrentProduct: (product: Product | null) => void;
    setSearchQuery: (query: string) => void;
    setSelectedCategory: (categoryId: string | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    removeProduct: (productId: string) => void;
    clearProducts: () => void;
    
    // Computed getters
    getFilteredProducts: () => Product[];
    getProductById: (id: string) => Product | undefined;
    getProductsByCategory: (categoryId: string) => Product[];
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    categories: [],
    currentProduct: null,
    searchQuery: '',
    selectedCategory: null,
    isLoading: false,
    error: null,

    setProducts: (products) => {
        set({ products });
    },

    setCategories: (categories) => {
        set({ categories });
    },

    setCurrentProduct: (currentProduct) => {
        set({ currentProduct });
    },

    setSearchQuery: (searchQuery) => {
        set({ searchQuery });
    },

    setSelectedCategory: (selectedCategory) => {
        set({ selectedCategory });
    },

    setLoading: (isLoading) => {
        set({ isLoading });
    },

    setError: (error) => {
        set({ error });
    },

    addProduct: (product) => {
        set((state) => ({
            products: [...state.products, product]
        }));
    },

    updateProduct: (updatedProduct) => {
        set((state) => ({
            products: state.products.map(product =>
                product.id === updatedProduct.id ? updatedProduct : product
            )
        }));
    },

    removeProduct: (productId) => {
        set((state) => ({
            products: state.products.filter(product => product.id !== productId)
        }));
    },

    clearProducts: () => {
        set({
            products: [],
            currentProduct: null,
            searchQuery: '',
            selectedCategory: null,
            error: null
        });
    },

    getFilteredProducts: () => {
        const { products, searchQuery, selectedCategory } = get();
        let filtered = products;

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(product => product.category.id === selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.category.name.toLowerCase().includes(query)
            );
        }

        return filtered;
    },

    getProductById: (id) => {
        const { products } = get();
        return products.find(product => product.id === id);
    },

    getProductsByCategory: (categoryId) => {
        const { products } = get();
        return products.filter(product => product.category.id === categoryId);
    },
}));