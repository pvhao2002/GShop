import React from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'expo-router';

export default function CartScreen() {
    const router = useRouter();

    // ✅ Lấy state và actions từ Zustand
    const items = useCartStore((s) => s.items);
    const removeItem = useCartStore((s) => s.removeItem);
    const clearCart = useCartStore((s) => s.clearCart);
    const updateQuantity = useCartStore((s) => s.updateQuantity);

    const totalItems = useCartStore((s) =>
        s.items.reduce((sum, it) => sum + it.quantity, 0)
    );
    const totalPrice = useCartStore((s) =>
        s.items.reduce((sum, it) => sum + it.price * it.quantity, 0)
    );

    return (
        <View style={s.container}>
            <Text style={s.title}>🛒 Your Cart</Text>

            <FlatList
                data={items}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={s.card}
                        onPress={() => router.push(`/(product)/${item.productId}`)} // ✅ đi đến trang chi tiết sản phẩm
                    >
                        <Image source={{ uri: item.image }} style={s.img} />
                        <View style={{ flex: 1 }}>
                            <Text style={s.name}>{item.name}</Text>

                            {item.variant && (
                                <Text style={s.variant}>
                                    {item.variant.size ?? ''} {item.variant.color ?? ''}
                                </Text>
                            )}

                            <Text style={s.price}>
                                {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                            </Text>

                            {/* 🎛 Controls */}
                            <View style={s.qtyRow}>
                                <TouchableOpacity
                                    style={s.qtyBtn}
                                    onPress={() =>
                                        updateQuantity(item.productId, item.variant?.variantId, -1)
                                    }>
                                    <Text style={s.qtyBtnText}>−</Text>
                                </TouchableOpacity>

                                <Text style={s.qtyValue}>{item.quantity}</Text>

                                <TouchableOpacity
                                    style={s.qtyBtn}
                                    onPress={() =>
                                        updateQuantity(item.productId, item.variant?.variantId, +1)
                                    }>
                                    <Text style={s.qtyBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() =>
                                removeItem(item.productId, item.variant?.variantId)
                            }>
                            <Text style={s.remove}>✕</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={s.empty}>Your cart is empty.</Text>
                }
            />

            {/* 🧾 Summary */}
            {items.length > 0 && (
                <>
                    <View style={s.summaryRow}>
                        <View>
                            <Text style={s.summaryLabel}>Total Items</Text>
                            <Text style={s.summaryValue}>{totalItems}</Text>
                        </View>

                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={s.summaryLabel}>Total Price</Text>
                            <Text style={s.totalPrice}>
                                {totalPrice.toLocaleString('vi-VN')} ₫
                            </Text>
                        </View>
                    </View>

                    <View style={s.actionRow}>
                        <TouchableOpacity style={s.clearBtn} onPress={clearCart}>
                            <Text style={s.clearText}>Clear Cart</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={s.checkoutBtn} onPress={() => router.push('/checkout')}>
                            <Text style={s.checkoutText}>Checkout</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },

    // --- Cart item ---
    card: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#f3f4f6',
        paddingBottom: 8,
    },
    img: { width: 70, height: 70, borderRadius: 8, marginRight: 10 },
    name: { fontWeight: '600', fontSize: 15 },
    variant: { color: '#6b7280', fontSize: 13 },
    price: { color: '#2563eb', fontWeight: '700', marginTop: 4 },
    remove: { color: '#dc2626', fontSize: 18, padding: 8 },
    empty: { textAlign: 'center', color: '#9ca3af', marginTop: 50 },

    // --- Quantity Controls ---
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 8,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
    },
    qtyBtnText: { fontSize: 18, fontWeight: '700', color: '#111827' },
    qtyValue: { minWidth: 26, textAlign: 'center', fontWeight: '600' },

    // --- Summary ---
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderColor: '#e5e7eb',
        paddingVertical: 14,
        marginTop: 10,
    },
    summaryLabel: { fontSize: 15, color: '#6b7280', fontWeight: '500' },
    summaryValue: { fontSize: 16, fontWeight: '600', color: '#111827' },
    totalPrice: { fontWeight: '800', color: '#2563eb', fontSize: 18 },

    // --- Action Buttons ---
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    clearBtn: {
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    clearText: { color: '#dc2626', fontWeight: '600' },
    checkoutBtn: {
        backgroundColor: '#2563eb',
        borderRadius: 30,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    checkoutText: { color: '#fff', fontWeight: '700' },
});
