import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {useAuthStore} from '@/store/authStore';
import {APP_CONFIG} from "@/constants/app-config";

export default function ProfileScreen() {
    const router = useRouter();
    const {user, logout} = useAuthStore();
    const token = user?.token;

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 💡 Menu danh sách có thêm 2 item mới
    const menuItems = [
        {icon: 'bag-handle-outline', label: 'My Orders', action: () => router.push('/history')},
        {icon: 'cart-outline', label: 'My Cart', action: () => router.push('/cart')},
        {icon: 'person-circle-outline', label: 'Update Profile', action: () => router.push('/update-profile')},
        {icon: 'lock-closed-outline', label: 'Changes Password', action: () => router.push('/change-password')},
        {icon: 'help-circle-outline', label: 'Help & Support', action: () => router.push('/support')},
        {icon: 'information-circle-outline', label: 'About App', action: () => router.push('/about')},
    ];

    // --- Fetch profile info ---
    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                router.replace('/login');
                return;
            }

            try {
                setLoading(true);
                const res = await fetch(`${APP_CONFIG.BASE_URL}${APP_CONFIG.API.AUTH.PROFILE}`, {
                    headers: {'Authorization': `Bearer ${token}`},
                });

                const json = await res.json();
                console.log('👤 Profile API response:', json);

                if (!res.ok || json.success === false) {
                    const msg = json.error?.message || json.message || 'Failed to fetch profile';
                    throw new Error(msg);
                }

                const data = json.data ?? json;
                setProfile(data);
            } catch (err: any) {
                console.error('❌ Profile load error:', err);
                Alert.alert('Error', err.message || 'Cannot load profile');
                if (err.message?.includes('Unauthorized')) {
                    router.replace('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token]);

    // --- Loading ---
    if (loading) {
        return (
            <View style={s.loadingWrap}>
                <ActivityIndicator size="large" color="#2563eb"/>
                <Text style={s.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    // --- Guest mode ---
    if (!user) {
        return (
            <View style={s.guestWrap}>
                <Image source={{uri: 'https://cdn-icons-png.flaticon.com/512/5087/5087579.png'}} style={s.guestImg}/>
                <Text style={s.guestTitle}>Welcome 👋</Text>
                <Text style={s.guestText}>
                    Please log in or register to manage your profile and orders.
                </Text>
                <TouchableOpacity style={s.primaryBtn} onPress={() => router.push('/login')}>
                    <Text style={s.primaryText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.secondaryBtn} onPress={() => router.push('/register')}>
                    <Text style={s.secondaryText}>Register</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // --- Main profile view ---
    return (
        <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={s.header}>
                <Image
                    source={{
                        uri: profile?.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                    }}
                    style={s.avatar}
                />
                <Text style={s.name}>{profile?.firstName} {profile?.lastName}</Text>
                <Text style={s.email}>{profile?.email}</Text>
                {profile?.phone ? <Text style={s.phone}>📞 {profile.phone}</Text> : null}
            </View>

            {/* Address */}
            {profile?.street && (
                <View style={s.addressBox}>
                    <Text style={s.addressTitle}>Shipping Address</Text>
                    <Text style={s.addressLine}>{profile.street}</Text>
                    <Text style={s.addressLine}>
                        {profile.city}, {profile.state}, {profile.zipCode}
                    </Text>
                    <Text style={s.addressLine}>{profile.country}</Text>
                </View>
            )}

            {/* Menu */}
            <View style={s.menuSection}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity key={index} style={s.menuItem} onPress={item.action}>
                        <View style={s.menuLeft}>
                            <Ionicons name={item.icon as any} size={22} color="#2563eb"/>
                            <Text style={s.menuText}>{item.label}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af"/>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout */}
            <TouchableOpacity style={s.logoutBtn} onPress={logout}>
                <Ionicons name="log-out-outline" size={18} color="#fff"/>
                <Text style={s.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#f9fafb'},
    loadingWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'},
    loadingText: {marginTop: 10, color: '#6b7280'},
    header: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
    },
    avatar: {width: 90, height: 90, borderRadius: 45, marginBottom: 10},
    name: {fontSize: 20, fontWeight: '700', color: '#111827'},
    email: {color: '#6b7280', fontSize: 14, marginTop: 2},
    phone: {color: '#374151', fontSize: 13, marginTop: 4},
    addressBox: {backgroundColor: '#fff', padding: 16, margin: 14, borderRadius: 10, elevation: 1},
    addressTitle: {fontWeight: '700', color: '#111827', marginBottom: 6},
    addressLine: {color: '#4b5563', fontSize: 13},
    menuSection: {
        backgroundColor: '#fff',
        marginTop: 14,
        borderRadius: 12,
        marginHorizontal: 14,
        overflow: 'hidden',
        elevation: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderColor: '#f3f4f6',
    },
    menuLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
    menuText: {fontSize: 15, color: '#111827', fontWeight: '500'},
    logoutBtn: {
        flexDirection: 'row',
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 30,
        marginTop: 24,
        marginHorizontal: 50,
        gap: 8,
    },
    logoutText: {color: '#fff', fontWeight: '700', fontSize: 15},
    guestWrap: {alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 20},
    guestImg: {width: 120, height: 120, marginBottom: 16},
    guestTitle: {fontSize: 22, fontWeight: '700', color: '#111827'},
    guestText: {color: '#6b7280', textAlign: 'center', marginVertical: 12, lineHeight: 20},
    primaryBtn: {
        backgroundColor: '#2563eb',
        borderRadius: 30,
        paddingVertical: 12,
        paddingHorizontal: 40,
        marginTop: 10,
    },
    primaryText: {color: '#fff', fontWeight: '700'},
    secondaryBtn: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 30,
        paddingVertical: 12,
        paddingHorizontal: 40,
        marginTop: 10,
    },
    secondaryText: {color: '#111827', fontWeight: '600'},
});
