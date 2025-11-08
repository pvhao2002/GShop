import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function PaymentSuccessScreen() {
    const { orderId, status, method } = useLocalSearchParams();
    const router = useRouter();
    const [displayStatus, setDisplayStatus] = useState<'pending' | 'success' | 'fail'>('pending');

    useEffect(() => {
        if (status === 'success') setDisplayStatus('success');
        else if (status === 'fail') setDisplayStatus('fail');
        else setDisplayStatus('pending');
    }, [status]);

    if (displayStatus === 'pending') {
        return (
            <View style={s.container}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ marginTop: 10, color: '#6b7280' }}>Processing payment...</Text>
            </View>
        );
    }

    return (
        <View style={s.container}>
            {displayStatus === 'success' ? (
                <>
                    <Text style={[s.title, { color: '#16a34a' }]}>🎉 Payment Successful!</Text>
                    <Text style={s.text}>Order #{orderId}</Text>
                    <Text style={s.text}>Payment Method: {String(method).toUpperCase()}</Text>

                    <TouchableOpacity style={s.btn} onPress={() => router.replace('/(tabs)/history')}>
                        <Text style={s.btnText}>View My Orders</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={[s.title, { color: '#dc2626' }]}>❌ Payment Failed</Text>
                    <Text style={s.text}>Order #{orderId}</Text>
                    <Text style={s.text}>Payment Method: {String(method).toUpperCase()}</Text>

                    <TouchableOpacity style={[s.btn, { backgroundColor: '#dc2626' }]} onPress={() => router.replace('/checkout')}>
                        <Text style={s.btnText}>Try Again</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: '800', marginBottom: 10 },
    text: { fontSize: 15, color: '#374151', marginBottom: 4 },
    btn: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 20 },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
