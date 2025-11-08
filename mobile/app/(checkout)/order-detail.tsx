import React, {useEffect, useState, useCallback} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useAuthStore} from '@/store/authStore';
import {APP_CONFIG} from '@/constants/app-config';

export default function OrderDetailScreen() {
    const {id} = useLocalSearchParams<{ id: string }>();
    const {user} = useAuthStore();
    const token = user?.token;
    const router = useRouter();

    const [order, setOrder] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrderDetail = useCallback(async () => {
        if (!id || !token) return;
        try {
            setLoading(true);
            const res = await fetch(`${APP_CONFIG.BASE_URL}/orders/${id}`, {
                headers: {Authorization: `Bearer ${token}`},
            });

            const json = await res.json();
            if (!res.ok || json.success === false) {
                throw new Error(json.error?.message || json.message || 'Failed to load order');
            }

            const data = json.data ?? json;
            setOrder(data);
        } catch (err: any) {
            console.error('❌ Order detail error:', err);
            Alert.alert('Error', err.message || 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useEffect(() => {
        fetchOrderDetail();
    }, [fetchOrderDetail]);

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color="#2563eb"/>
                <Text style={s.loadingText}>Loading order details...</Text>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={s.center}>
                <Ionicons name="alert-circle-outline" size={48} color="#9ca3af"/>
                <Text style={s.errorText}>Order not found.</Text>
            </View>
        );
    }

    const formatDate = (dateString?: string) =>
        dateString ? new Date(dateString).toLocaleString('vi-VN') : '—';

    return (
        <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
            {/* Order Status */}
            <View style={[s.statusBox, getStatusStyle(order.status)]}>
                <Ionicons name="information-circle-outline" size={20} color={getStatusStyle(order.status).color}/>
                <Text style={[s.statusText, {color: getStatusStyle(order.status).color}]}>
                    {order.status}
                </Text>
            </View>

            {/* Order Info */}
            <View style={s.section}>
                <Text style={s.headerTitle}>Order #{order.id}</Text>

                <Text style={s.sectionTitle}>Customer Info</Text>
                <View style={s.row}>
                    <Ionicons name="person-outline" size={18} color="#6b7280"/>
                    <Text style={s.infoText}>{order.userName}</Text>
                </View>
                <View style={s.row}>
                    <Ionicons name="mail-outline" size={18} color="#6b7280"/>
                    <Text style={s.infoText}>{order.userEmail}</Text>
                </View>
                <View style={s.row}>
                    <Ionicons name="call-outline" size={18} color="#6b7280"/>
                    <Text style={s.infoText}>{order.phone || '—'}</Text>
                </View>
            </View>

            {/* Shipping Address */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>Shipping Address</Text>
                <View style={s.row}>
                    <Ionicons name="location-outline" size={18} color="#6b7280"/>
                    <Text style={s.infoText}>
                        {order.shippingAddress?.street}, {order.shippingAddress?.city}
                    </Text>
                </View>
                <Text style={s.subInfoText}>
                    {order.shippingAddress?.state}, {order.shippingAddress?.country}
                    {order.shippingAddress?.zipCode ? ` (ZIP ${order.shippingAddress.zipCode})` : ''}
                </Text>
            </View>

            {/* Payment Info */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>Payment & Summary</Text>

                <View style={s.rowBetween}>
                    <Text style={s.label}>Payment Method</Text>
                    <Text style={s.value}>{order.paymentMethod}</Text>
                </View>
                <View style={s.rowBetween}>
                    <Text style={s.label}>Subtotal</Text>
                    <Text style={s.value}>{Number(order.subtotal).toLocaleString('vi-VN')} ₫</Text>
                </View>
                <View style={s.rowBetween}>
                    <Text style={s.label}>Tax</Text>
                    <Text style={s.value}>{Number(order.tax).toLocaleString('vi-VN')} ₫</Text>
                </View>
                <View style={s.rowBetween}>
                    <Text style={s.label}>Shipping</Text>
                    <Text style={s.value}>{Number(order.shipping).toLocaleString('vi-VN')} ₫</Text>
                </View>

                <View style={s.divider}/>
                <View style={s.rowBetween}>
                    <Text style={s.totalLabel}>Total</Text>
                    <Text style={s.totalValue}>{Number(order.total).toLocaleString('vi-VN')} ₫</Text>
                </View>
            </View>

            {/* Order Items */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>Items ({order.items?.length})</Text>

                {order.items?.map((item: any) => (
                    <View key={item.id} style={s.itemCard}>
                        {/* Product Image */}
                        <View style={s.itemLeft}>
                            {item.productImage ? (
                                <View style={s.imageWrap}>
                                    <Image
                                        source={{ uri: item.productImage }}
                                        style={{ width: 60, height: 60, borderRadius: 8 }}
                                        resizeMode="cover"
                                    />
                                </View>
                            ) : (
                                <View style={[s.imageWrap, s.imagePlaceholder]}>
                                    <Ionicons name="image-outline" size={24} color="#9ca3af" />
                                </View>
                            )}
                        </View>

                        {/* Product Info */}
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={s.itemName}>{item.productName}</Text>

                            {/* Variant Info */}
                            <View style={s.variantRow}>
                                {item.variantSize && (
                                    <Text style={s.variantText}>Size: {item.variantSize}</Text>
                                )}
                                {item.variantColor && (
                                    <View style={s.variantColorBox}>
                                        <Text style={s.variantText}>Color: {item.variantColor}</Text>
                                        {item.variantColorHex && (
                                            <View
                                                style={[
                                                    s.colorDot,
                                                    { backgroundColor: item.variantColorHex },
                                                ]}
                                            />
                                        )}
                                    </View>
                                )}
                            </View>

                            <Text style={s.itemDesc}>Qty: {item.quantity}</Text>
                        </View>

                        {/* Price Section */}
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={s.itemPrice}>
                                {Number(item.unitPrice).toLocaleString('vi-VN')} ₫
                            </Text>
                            <Text style={s.itemSub}>
                                Total: {Number(item.totalPrice).toLocaleString('vi-VN')} ₫
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Shipping & Delivery Dates */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>Delivery Info</Text>
                <View style={s.rowBetween}>
                    <Text style={s.label}>Shipping Date</Text>
                    <Text style={s.value}>{formatDate(order.shippingDate)}</Text>
                </View>
                <View style={s.rowBetween}>
                    <Text style={s.label}>Delivery Date</Text>
                    <Text style={s.value}>{formatDate(order.deliveryDate)}</Text>
                </View>
            </View>

            {/* Timeline */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>Order Timeline</Text>
                <Text style={s.dateText}>Created: {formatDate(order.createdAt)}</Text>
                <Text style={s.dateText}>Updated: {formatDate(order.updatedAt)}</Text>
            </View>

            <View style={{height: 40}}/>
        </ScrollView>
    );
}

/** 🎨 Status style */
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
    container: {flex: 1, backgroundColor: '#f9fafb', padding: 16},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    loadingText: {color: '#6b7280', marginTop: 10},
    errorText: {color: '#9ca3af', marginTop: 10},

    statusBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 12,
    },
    statusText: {fontWeight: '700', fontSize: 13, textTransform: 'capitalize'},

    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    headerTitle: {fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 10},
    sectionTitle: {fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 8},
    row: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4},
    rowBetween: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6},
    infoText: {color: '#374151', fontSize: 13},
    subInfoText: {color: '#6b7280', fontSize: 12, marginLeft: 24},

    label: {color: '#6b7280', fontSize: 13},
    value: {fontWeight: '600', color: '#111827', fontSize: 13},
    divider: {height: 1, backgroundColor: '#f3f4f6', marginVertical: 8},
    totalLabel: {fontSize: 14, fontWeight: '600', color: '#374151'},
    totalValue: {fontSize: 17, fontWeight: '800', color: '#2563eb'},

    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f9fafb',
        padding: 10,
        borderRadius: 10,
        marginBottom: 8,
    },
    itemName: {fontWeight: '600', color: '#111827'},
    itemDesc: {color: '#6b7280', fontSize: 12},
    itemPrice: {fontWeight: '700', color: '#111827'},
    itemSub: {color: '#6b7280', fontSize: 12},
    dateText: {color: '#6b7280', fontSize: 12, marginBottom: 2},
    // --- Item styles enhancement ---
    imageWrap: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    imagePlaceholder: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    itemLeft: { justifyContent: 'center' },
    variantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
    },
    variantText: {
        fontSize: 12,
        color: '#6b7280',
    },
    variantColorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: '#d1d5db',
    },
});
