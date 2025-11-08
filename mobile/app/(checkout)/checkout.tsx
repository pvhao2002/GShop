import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useCartStore} from '@/store/cartStore';
import {useAuthStore} from '@/store/authStore';
import {useRouter} from 'expo-router';
import {APP_CONFIG} from "@/constants/app-config";
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export default function CheckoutScreen() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const token = user?.token;
    const {items, clearCart} = useCartStore();

    const totalPrice = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

    // --- form fields ---
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [country, setCountry] = useState('Vietnam');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOMO' | 'VNPAY'>('COD');
    const [loading, setLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // --- Fetch profile when screen mounts ---
    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                router.replace('/login');
                return;
            }

            try {
                setLoadingProfile(true);
                const res = await fetch(`${APP_CONFIG.BASE_URL}${APP_CONFIG.API.AUTH.PROFILE}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error('Failed to load profile');

                const data = await res.json();
                // Fill in user info if available
                if (data) {
                    setPhone(data.phone || '');
                    setStreet(data.street || '');
                    setCity(data.city || '');
                    setState(data.state || '');
                    setZipCode(data.zipCode || '');
                    setCountry(data.country || 'Vietnam');
                }
            } catch (err) {
                console.error('Profile fetch error:', err);
                Alert.alert('⚠️', 'Cannot load user profile. Please login again.');
                router.replace('/login');
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfile().then();
    }, [token]);

    // --- Handle checkout ---
    const handleCheckout = async () => {
        if (!street || !city || !state || !zipCode || !country || !phone) {
            Alert.alert('⚠️ Missing Info', 'Please fill all required fields.');
            return;
        }

        if (paymentMethod === 'MOMO') {
            // alert not support
            Alert.alert('⚠️ Info', 'This payment method is not support. Please try again');
            return;
        }

        const requestBody = {
            items: items.map((it) => ({
                productId: it.productId,
                variantId: it.variant?.variantId ?? null,
                quantity: it.quantity,
            })),
            shippingAddress: {street, city, state, zipCode, country},
            paymentMethod,
            phone: phone
        };

        try {
            setLoading(true);
            const res = await fetch(`${APP_CONFIG.BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!res.ok) {
                const errorText = await res.json();
                throw new Error(errorText || 'Failed to create order');
            }

            const data = await res.json();

            if (paymentMethod === 'VNPAY') {
                const redirectUrl = Linking.createURL('payment/success', {
                    queryParams: {method: paymentMethod, orderId: data.id.toString()},
                });
                console.log(redirectUrl)
                const paymentRequest = {
                    orderId: data.id,
                    amount: data.total,
                    paymentMethod: "VNPAY"
                };
                const res = await fetch(
                    `${APP_CONFIG.BASE_URL}/payment/process`,
                    {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}`},
                        body: JSON.stringify(paymentRequest)
                    },
                );
                const json = await res.json();
                if (!res.ok || !json.data.paymentUrl) throw new Error(json.message || 'Create payment failed');
                const result = await WebBrowser.openAuthSessionAsync(json.data.paymentUrl, redirectUrl);
                if (result.type === 'success') {
                    clearCart();
                    router.replace({
                        pathname: '/payment-success',
                        params: {orderId: data.id, status: 'success', method: 'VNPAY'},
                    });
                } else {
                    Alert.alert('❌ Error', 'Payment failed or closed');
                    await cancelOrder(data.id);
                    router.replace({
                        pathname: '/payment-success',
                        params: {orderId: data.id, status: 'fail', method: 'VNPAY'},
                    });
                }
            } else {
                clearCart();
                Alert.alert('✅ Success', 'Your order has been placed successfully!', [
                    {text: 'OK', onPress: () => router.replace('/(tabs)/history')},
                ]);
            }
        } catch (err: any) {
            console.error('Order failed', err);
            Alert.alert('❌ Error', err.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (oid: string) => {
        await fetch(
            `${APP_CONFIG.BASE_URL}/payment/cancel/${oid}`,
            {
                method: 'GET',
                headers: {'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}`},
            },
        );
    };

    if (loadingProfile) {
        return (
            <View style={[s.container, {justifyContent: 'center', alignItems: 'center'}]}>
                <ActivityIndicator size="large" color="#2563eb"/>
                <Text style={{marginTop: 10, color: '#6b7280'}}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
            <Text style={s.title}>Checkout</Text>

            {/* --- SHIPPING ADDRESS --- */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>Shipping Address</Text>

                <TextInput style={s.input} placeholder="Street" value={street} onChangeText={setStreet}/>
                <TextInput style={s.input} placeholder="City" value={city} onChangeText={setCity}/>
                <TextInput style={s.input} placeholder="State" value={state} onChangeText={setState}/>
                <TextInput style={s.input} placeholder="Zip Code" value={zipCode} onChangeText={setZipCode}/>
                <TextInput style={s.input} placeholder="Country" value={country} onChangeText={setCountry}/>
                <TextInput style={s.input} placeholder="Phone" value={phone} onChangeText={setPhone}/>
            </View>

            {/* --- PAYMENT METHODS --- */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>Payment Method</Text>
                {['COD', 'VNPAY'].map((method) => (
                    <TouchableOpacity
                        key={method}
                        style={[s.payOption, paymentMethod === method && s.paySelected]}
                        onPress={() => setPaymentMethod(method as any)}
                    >
                        <Ionicons
                            name={paymentMethod === method ? 'radio-button-on' : 'radio-button-off'}
                            size={22}
                            color={paymentMethod === method ? '#2563eb' : '#9ca3af'}
                        />
                        <View style={{marginLeft: 10}}>
                            <Text style={s.payLabel}>
                                {method === 'COD'
                                    ? 'Cash on Delivery (COD)'
                                    : method === 'MOMO'
                                        ? 'MoMo E-Wallet'
                                        : 'VNPay Online Payment'}
                            </Text>
                            <Text style={s.payDesc}>
                                {method === 'COD'
                                    ? 'Pay in cash when order arrives'
                                    : method === 'MOMO'
                                        ? 'Fast, secure via MoMo'
                                        : 'Online payment via VNPay'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* --- ORDER SUMMARY --- */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>Order Summary</Text>
                {items.map((it, i) => (
                    <View key={i} style={s.orderRow}>
                        <Text style={s.orderName}>
                            {it.name} × {it.quantity}
                        </Text>
                        <Text style={s.orderPrice}>
                            {(it.price * it.quantity).toLocaleString('vi-VN')} ₫
                        </Text>
                    </View>
                ))}
                <View style={s.divider}/>
                <View style={s.orderRow}>
                    <Text style={s.orderTotalLabel}>Total</Text>
                    <Text style={s.orderTotalValue}>
                        {totalPrice.toLocaleString('vi-VN')} ₫
                    </Text>
                </View>
            </View>

            {/* --- BUTTON --- */}
            <TouchableOpacity style={s.checkoutBtn} onPress={handleCheckout} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff"/>
                ) : (
                    <>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff"/>
                        <Text style={s.checkoutText}>Place Order</Text>
                    </>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff', padding: 16},
    title: {fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 20},
    section: {marginBottom: 26},
    sectionTitle: {fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 10},
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#f9fafb',
    },
    payOption: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    paySelected: {borderColor: '#2563eb', backgroundColor: '#eff6ff'},
    payLabel: {fontWeight: '600', color: '#111827'},
    payDesc: {fontSize: 13, color: '#6b7280', marginTop: 2},
    orderRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6},
    orderName: {fontSize: 14, color: '#111827', flex: 1},
    orderPrice: {fontWeight: '600', color: '#2563eb'},
    divider: {height: 1, backgroundColor: '#e5e7eb', marginVertical: 10},
    orderTotalLabel: {fontWeight: '700', color: '#111827', fontSize: 16},
    orderTotalValue: {fontWeight: '800', color: '#2563eb', fontSize: 18},
    checkoutBtn: {
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        paddingVertical: 14,
        marginTop: 10,
        gap: 8,
    },
    checkoutText: {color: '#fff', fontWeight: '700', fontSize: 16},
});
