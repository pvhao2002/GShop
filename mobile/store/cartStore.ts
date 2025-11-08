import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartVariant {
    variantId?: number;
    color?: string;
    size?: string;
    quantity: number;
    additionalPrice?: number;
}

export interface CartItem {
    productId: number;
    name: string;
    price: number;
    image?: string;
    variant?: CartVariant | null;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (productId: number, variantId?: number) => void;
    clearCart: () => void;
    getTotalQuantity: () => number;
    getTotalPrice: () => number;
    updateQuantity: (productId: number, variantId?: number, delta?: number) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            updateQuantity: (productId, variantId, delta) => {
                const newItems = get().items.map((it) => {
                    if (it.productId === productId && it.variant?.variantId === variantId) {
                        const newQty = Math.max(1, it.quantity + (delta ?? 0));
                        return {...it, quantity: newQty};
                    }
                    return it;
                });
                set({items: newItems});
            },

            addItem: (item) => {
                const currentItems = get().items;
                const existing = currentItems.find(
                    (it) =>
                        it.productId === item.productId &&
                        it.variant?.variantId === item.variant?.variantId
                );

                if (existing) {
                    const updated = currentItems.map((it) =>
                        it.productId === item.productId &&
                        it.variant?.variantId === item.variant?.variantId
                            ? {...it, quantity: it.quantity + item.quantity}
                            : it
                    );
                    set({items: updated});
                } else {
                    set({items: [...currentItems, item]});
                }
            },

            removeItem: (productId, variantId) => {
                set({
                    items: get().items.filter(
                        (it) =>
                            it.productId !== productId ||
                            it.variant?.variantId !== variantId
                    ),
                });
            },

            clearCart: () => set({items: []}),
            getTotalQuantity: () => get().items.reduce((sum, it) => sum + it.quantity, 0),
            getTotalPrice: () =>
                get().items.reduce((sum, it) => sum + it.price * it.quantity, 0),
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => AsyncStorage), // ✅ Adapter chuẩn Zustand v5
        }
    )
);
