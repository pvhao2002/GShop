import { CartItem } from '../types';
import apiService from './apiService';

interface AddToCartRequest {
    productId: string;
    sizeId: string;
    colorId: string;
    quantity: number;
}

interface UpdateCartItemRequest {
    cartItemId: string;
    quantity: number;
}



class CartService {
    /**
     * Get user's cart items
     */
    async getCart(): Promise<CartItem[]> {
        return apiService.get<CartItem[]>('/cart');
    }

    /**
     * Add item to cart
     */
    async addToCart(item: AddToCartRequest): Promise<CartItem> {
        return apiService.post<CartItem>('/cart/add', item);
    }

    /**
     * Update cart item quantity
     */
    async updateCartItem(update: UpdateCartItemRequest): Promise<CartItem> {
        return apiService.put<CartItem>('/cart/update', update);
    }

    /**
     * Remove item from cart
     */
    async removeFromCart(cartItemId: string): Promise<void> {
        return apiService.delete<void>(`/cart/remove/${cartItemId}`);
    }

    /**
     * Clear entire cart
     */
    async clearCart(): Promise<void> {
        return apiService.delete<void>('/cart/clear');
    }

    /**
     * Get cart total
     */
    async getCartTotal(): Promise<{ subtotal: number; tax: number; shipping: number; total: number }> {
        return apiService.get<{ subtotal: number; tax: number; shipping: number; total: number }>('/cart/total');
    }

    /**
     * Sync local cart with server (useful after login)
     */
    async syncCart(localCartItems: CartItem[]): Promise<CartItem[]> {
        return apiService.post<CartItem[]>('/cart/sync', { items: localCartItems });
    }
}

export default new CartService();