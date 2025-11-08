import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { APP_CONFIG } from '@/constants/app-config';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const router = useRouter();
    const loginStore = useAuthStore((s) => s.login);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        try {
            setLoading(true);
            const res = await axios.post(`${APP_CONFIG.BASE_URL}${APP_CONFIG.API.AUTH.LOGIN}`, {
                email,
                password,
            });
            const data = res.data;
            if (data) {
                loginStore(data);
                Alert.alert('Success', 'Welcome back!');
                router.replace('/(tabs)/profile');
            } else Alert.alert('Error', 'Invalid response from server');
        } catch (err: any) {
            Alert.alert('Login failed', err.response?.data?.message || 'Please check your credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#fff' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
                <Text style={s.title}>Welcome Back 👋</Text>
                <Text style={s.subtitle}>Login to continue shopping</Text>

                <View style={s.inputBox}>
                    <Ionicons name="mail-outline" size={20} color="#6b7280" style={s.icon} />
                    <TextInput
                        placeholder="Email"
                        style={s.input}
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                </View>

                <View style={s.inputBox}>
                    <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={s.icon} />
                    <TextInput
                        placeholder="Password"
                        style={s.input}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Login</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text style={s.link}>Don’t have an account? Register</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    title: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 8 },
    subtitle: { color: '#6b7280', marginBottom: 24 },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    icon: { marginRight: 6 },
    input: { flex: 1, height: 44, fontSize: 15 },
    btn: {
        backgroundColor: '#2563eb',
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 8,
    },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    link: { textAlign: 'center', marginTop: 18, color: '#2563eb', fontWeight: '600' },
});
