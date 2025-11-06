import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartState {
    cartItems: CartItem[];
    isLoading: boolean;
    error: string | null;
    
    // Actions
    addToCart: (product: Product, sizeId: string, colorId: string, quantity?: number) => void;
    removeFromCart: (productId: string, sizeId: string, colorId: string) => void;
    updateQuantity: (productId: string, sizeId: string, colorId: string, quantity: number) => void;
    clearCart: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    
    // Computed getters
    getCartTotal: () => number;
    getCartItemCount: () => number;
    getCartItem: (productId: string, sizeId: string, colorId: string) => CartItem | undefined;
    isInCart: (productId: string, sizeId: string, colorId: string) => boolean;
}

export const useCartStore = create<CartState>((set, get) => ({
    cartItems: [],
    isLoading: false,
    error: null,

    addToCart: (product, sizeId, colorId, quantity = 1) => {
        set((state) => {
            const existingItemIndex = state.cartItems.findIndex(
                item => item.productId === product.id && 
                        item.sizeId === sizeId && 
                        item.colorId === colorId
            );

            if (existingItemIndex >= 0) {
                // Update existing item quantity
                const updatedItems = [...state.cartItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + quantity
                };
                return { cartItems: updatedItems };
            } else {
                // Add new item
                const newItem: CartItem = {
                    productId: product.id,
                    product,
                    sizeId,
                    colorId,
                    quantity,
                    addedAt: new Date()
                };
                return { cartItems: [...state.cartItems, newItem] };
            }
        });
    },

    removeFromCart: (productId, sizeId, colorId) => {
        set((state) => ({
            cartItems: state.cartItems.filter(
                item => !(item.productId === productId && 
                         item.sizeId === sizeId && 
                         item.colorId === colorId)
            )
        }));
    },

    updateQuantity: (productId, sizeId, colorId, quantity) => {
        if (quantity <= 0) {
            get().removeFromCart(productId, sizeId, colorId);
            return;
        }

        set((state) => ({
            cartItems: state.cartItems.map(item =>
                item.productId === productId && 
                item.sizeId === sizeId && 
                item.colorId === colorId
                    ? { ...item, quantity }
                    : item
            )
        }));
    },

    clearCart: () => {
        set({ cartItems: [], error: null });
    },

    setLoading: (isLoading) => {
        set({ isLoading });
    },

    setError: (error) => {
        set({ error });
    },

    getCartTotal: () => {
        const { cartItems } = get();
        return cartItems.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    },

    getCartItemCount: () => {
        const { cartItems } = get();
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    },

    getCartItem: (productId, sizeId, colorId) => {
        const { cartItems } = get();
        return cartItems.find(
            item => item.productId === productId && 
                   item.sizeId === sizeId && 
                   item.colorId === colorId
        );
    },

    isInCart: (productId, sizeId, colorId) => {
        const { cartItems } = get();
        return cartItems.some(
            item => item.productId === productId && 
                   item.sizeId === sizeId && 
                   item.colorId === colorId
        );
    },
}));