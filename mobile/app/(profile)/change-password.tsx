import React, {useState} from 'react';
import {ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useAuthStore} from '@/store/authStore';
import {APP_CONFIG} from '@/constants/app-config';

export default function ChangePasswordScreen() {
    const {user, logout} = useAuthStore();
    const token = user?.token;

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('⚠️ Missing Info', 'Please fill in all fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('⚠️ Error', 'Passwords do not match.');
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`${APP_CONFIG.BASE_URL}/users/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword,
                }),
            });

            const json = await res.json();

            // ✅ Xử lý response theo StandardApiResponse
            if (!res.ok || json.success === false) {
                const errMsg = json.error?.message || json.message || 'Password change failed';
                console.error('🟥 Change password error:', json.error ?? json);
                throw new Error(errMsg);
            }

            Alert.alert('✅ Success', json.message || 'Password changed successfully', [
                {
                    text: 'OK', onPress: () => {
                        logout();
                    }
                },
            ]);
        } catch (err: any) {
            console.error('❌ Change password failed:', err);
            Alert.alert('❌ Error', err.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={s.container}>
            <Text style={s.title}>Change Password</Text>

            <TextInput
                style={s.input}
                placeholder="Current Password"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
            />
            <TextInput
                style={s.input}
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
            />
            <TextInput
                style={s.input}
                placeholder="Confirm New Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <TouchableOpacity style={s.saveBtn} onPress={handleChangePassword} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff"/>
                ) : (
                    <>
                        <Ionicons name="lock-closed-outline" size={20} color="#fff"/>
                        <Text style={s.saveText}>Change Password</Text>
                    </>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff', padding: 16},
    title: {fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 20},
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
    saveText: {color: '#fff', fontWeight: '700', fontSize: 16},
});
