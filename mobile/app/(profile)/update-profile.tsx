import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { APP_CONFIG } from '@/constants/app-config';

export default function UpdateProfileScreen() {
    const { user } = useAuthStore();
    const token = user?.token;
    const router = useRouter();

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // --- Load current profile ---
    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                router.replace('/login');
                return;
            }
            try {
                setLoading(true);
                const res = await fetch(`${APP_CONFIG.BASE_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await res.json();

                // ✅ Chuẩn hoá parse theo StandardApiResponse
                if (!res.ok || json.success === false) {
                    const msg = json.error?.message || json.message || 'Failed to load profile';
                    throw new Error(msg);
                }

                const data = json.data ?? json;
                setForm({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    phone: data.phone || '',
                    street: data.street || '',
                    city: data.city || '',
                    state: data.state || '',
                    zipCode: data.zipCode || '',
                    country: data.country || 'Vietnam',
                });
            } catch (err: any) {
                console.error('❌ Profile load error:', err);
                Alert.alert('Error', err.message || 'Cannot load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [token]);

    // --- Update profile ---
    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await fetch(`${APP_CONFIG.BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            const json = await res.json();

            // ✅ Xử lý theo chuẩn StandardApiResponse
            if (!res.ok || json.success === false) {
                const errMsg = json.error?.message || json.message || 'Update failed';
                const details = json.error?.details ? JSON.stringify(json.error.details) : '';
                console.error(`🟥 Update error: ${errMsg} ${details}`);
                throw new Error(errMsg);
            }

            Alert.alert('✅ Success', json.message || 'Profile updated successfully', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err: any) {
            console.error('❌ Update error:', err);
            Alert.alert('❌ Error', err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={s.loadingWrap}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={s.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={s.container}>
            <Text style={s.title}>Update Profile</Text>
            {Object.entries(form).map(([key, value]) => (
                <TextInput
                    key={key}
                    style={s.input}
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={value}
                    onChangeText={(t) => setForm({ ...form, [key]: t })}
                />
            ))}

            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : (
                    <>
                        <Ionicons name="save-outline" size={20} color="#fff" />
                        <Text style={s.saveText}>Save Changes</Text>
                    </>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 20 },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
        backgroundColor: '#f9fafb',
    },
    saveBtn: {
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        paddingVertical: 14,
        gap: 8,
    },
    saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#6b7280', marginTop: 10 },
});
