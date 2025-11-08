import React, {useEffect, useState, useCallback} from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useAuthStore} from '@/store/authStore';
import {useRouter} from 'expo-router';
import {APP_CONFIG} from '@/constants/app-config';

export default function HistoryScreen() {
    const {user} = useAuthStore();
    const token = user?.token;
    const router = useRouter();

    const [orders, setOrders] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasNext, setHasNext] = useState(false);

    /** 📦 Gọi API danh sách đơn hàng */
    const fetchOrders = useCallback(
        async (reset = false) => {
            if (!token) {
                router.replace('/login');
                return;
            }
            try {
                if (reset) setPage(0);
                if (!reset) setLoading(true);

                const res = await fetch(
                    `${APP_CONFIG.BASE_URL}/orders/my-orders?page=${reset ? 0 : page}&size=${size}`,
                    {headers: {Authorization: `Bearer ${token}`}}
                );

                const json = await res.json();
                if (!res.ok || json.success === false) {
                    throw new Error(json.error?.message || json.message || 'Failed to load orders');
                }

                const data = json.data ?? json;
                reset ? setOrders(data.content) : setOrders((prev) => [...prev, ...data.content]);
                setHasNext(data.hasNext);
            } catch (err: any) {
                console.error('❌ Fetch orders error:', err);
                Alert.alert('Error', err.message || 'Failed to load orders');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [token, router, page, size]
    );

    useEffect(() => {
        fetchOrders(true);
    }, [fetchOrders]);

    useEffect(() => {
        if (page > 0) fetchOrders(false);
    }, [page, fetchOrders]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders(true);
    };

    /** ❌ Huỷ đơn hàng */
    const handleCancel = async (orderId: number) => {
        Alert.alert('Confirm', 'Do you really want to cancel this order?', [
            {text: 'No'},
            {
                text: 'Yes',
                onPress: async () => {
                    try {
                        const res = await fetch(`${APP_CONFIG.BASE_URL}/orders/${orderId}/cancel`, {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        });
                        const json = await res.json();
                        if (!res.ok || json.success === false)
                            throw new Error(json.error?.message || json.message || 'Cancel failed');

                        Alert.alert('✅ Success', 'Order has been cancelled.');
                        fetchOrders(true);
                    } catch (err: any) {
                        Alert.alert('❌ Error', err.message || 'Failed to cancel order');
                    }
                },
            },
        ]);
    };

    /** 🧾 Render từng đơn hàng */
    const renderOrder = ({item}: { item: any }) => (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push({pathname: '/order-detail', params: {id: item.id}})}
        >
            <View style={s.card}>
                {/* --- HEADER --- */}
                <View style={s.headerRow}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                        <Ionicons name="person-circle-outline" size={22} color="#2563eb"/>
                        <Text style={s.buyerName}>{item.userName || 'Customer'}</Text>
                    </View>
                    <Text style={[s.status, getStatusStyle(item.status)]}>{item.status}</Text>
                </View>

                <Text style={s.date}>
                    🗓 {new Date(item.createdAt).toLocaleString('vi-VN')}
                </Text>

                {/* --- ADDRESS --- */}
                <View style={s.sectionRow}>
                    <Ionicons name="location-outline" size={18} color="#6b7280"/>
                    <View style={{flex: 1}}>
                        <Text style={s.addressText}>
                            {item.shippingAddress?.street}, {item.shippingAddress?.city}
                        </Text>
                        <Text style={s.addressText}>
                            {item.shippingAddress?.state}, {item.shippingAddress?.country}
                        </Text>
                        {item.shippingAddress?.zipCode && (
                            <Text style={s.addressZip}>ZIP: {item.shippingAddress.zipCode}</Text>
                        )}
                    </View>
                </View>

                {/* --- CONTACT --- */}
                <View style={s.sectionRow}>
                    <Ionicons name="call-outline" size={18} color="#6b7280"/>
                    <Text style={s.phoneText}>{item?.phone ?? 'N/A'}</Text>
                </View>

                {/* --- PAYMENT --- */}
                <View style={s.sectionRow}>
                    <Ionicons name="card-outline" size={18} color="#6b7280"/>
                    <Text style={s.paymentText}>
                        Payment: {item.paymentMethod} · {item.itemCount} items
                    </Text>
                </View>

                {/* --- TOTAL --- */}
                <View style={s.divider}/>
                <View style={s.footerRow}>
                    <View>
                        <Text style={s.totalLabel}>Total Amount</Text>
                        <Text style={s.totalValue}>
                            {Number(item.total).toLocaleString('vi-VN')} ₫
                        </Text>
                    </View>

                    {/* ✅ Nút Cancel riêng */}
                    {(item.status === 'PENDING' || (item.status === 'PROCESSING' && item.paymentMethod !== 'VNPAY')) && (
                        <TouchableOpacity
                            style={[s.actionBtn, {backgroundColor: '#dc2626'}]}
                            onPress={() => handleCancel(item.id)}
                        >
                            <Ionicons name="close-circle-outline" size={18} color="#fff"/>
                            <Text style={s.actionText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderFooter = () =>
        hasNext ? <ActivityIndicator style={{marginVertical: 20}} color="#2563eb"/> : null;

    if (loading && !orders.length) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color="#2563eb"/>
                <Text style={s.loadingText}>Loading your orders...</Text>
            </View>
        );
    }

    return (
        <View style={s.container}>
            <View style={s.pageHeader}>
                <Ionicons name="bag-handle-outline" size={24} color="#2563eb"/>
                <Text style={s.pageTitle}>My Orders</Text>
            </View>

            {orders.length === 0 ? (
                <View style={s.emptyWrap}>
                    <Ionicons name="file-tray-outline" size={60} color="#9ca3af"/>
                    <Text style={s.emptyText}>You have no orders yet</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrder}
                    keyExtractor={(item) => item.id.toString()}
                    onEndReached={() => setPage((p) => (hasNext ? p + 1 : p))}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={renderFooter}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
                    }
                    contentContainerStyle={{paddingBottom: 20}}
                />
            )}
        </View>
    );
}

/** 🎨 Style màu trạng thái */
const getStatusStyle = (status: string) => {
    switch (status) {
        case 'DELIVERED':
            return {color: '#16a34a', backgroundColor: '#dcfce7'};
        case 'PROCESSING':
            return {color: '#2563eb', backgroundColor: '#e0f2fe'};
        case 'SHIPPED':
            return {color: '#0891b2', backgroundColor: '#cffafe'};
        case 'CANCELLED':
            return {color: '#dc2626', backgroundColor: '#fee2e2'};
        case 'PENDING':
        default:
            return {color: '#f59e0b', backgroundColor: '#fef3c7'};
    }
};

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 12},
    pageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 14,
    },
    pageTitle: {fontSize: 20, fontWeight: '700', color: '#111827'},

    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        marginBottom: 14,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    buyerName: {fontSize: 15, fontWeight: '600', color: '#111827'},
    status: {
        fontWeight: '700',
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 20,
        overflow: 'hidden',
        textTransform: 'capitalize',
        fontSize: 13,
    },
    date: {color: '#6b7280', fontSize: 12, marginBottom: 10},

    sectionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 6,
    },
    addressText: {color: '#374151', fontSize: 13},
    addressZip: {color: '#9ca3af', fontSize: 12},
    phoneText: {color: '#374151', fontSize: 13},
    paymentText: {color: '#374151', fontSize: 13},

    divider: {height: 1, backgroundColor: '#f3f4f6', marginVertical: 12},

    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {fontSize: 13, color: '#6b7280'},
    totalValue: {fontWeight: '800', color: '#2563eb', fontSize: 17},

    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 30,
        paddingVertical: 8,
        paddingHorizontal: 16,
        gap: 6,
    },
    actionText: {color: '#fff', fontWeight: '700', fontSize: 14},

    center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    loadingText: {marginTop: 10, color: '#6b7280'},
    emptyWrap: {alignItems: 'center', marginTop: 100},
    emptyText: {marginTop: 10, color: '#9ca3af', fontSize: 15},
});
