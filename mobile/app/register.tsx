import React, {useState} from 'react';
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
import {Ionicons} from '@expo/vector-icons';
import axios from 'axios';
import {APP_CONFIG} from '@/constants/app-config';
import {useRouter} from 'expo-router';
import {useAuthStore} from '@/store/authStore';

export default function RegisterScreen() {
    const router = useRouter();
    const loginStore = useAuthStore((s) => s.login);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        city: '',
        country: '',
    });
    const [loading, setLoading] = useState(false);
    const handleChange = (k: string, v: string) => setForm({...form, [k]: v});

    const handleRegister = async () => {
        const {firstName, lastName, email, password} = form;
        if (!firstName || !lastName || !email || !password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        try {
            setLoading(true);
            const res = await axios.post(`${APP_CONFIG.BASE_URL}${APP_CONFIG.API.AUTH.REGISTER}`, form);
            const data = res.data;
            if (data) {
                loginStore(data);
                Alert.alert('Success', 'Account created successfully!');
                router.replace('/(tabs)/profile');
            } else Alert.alert('Error', 'Unexpected server response');
        } catch (err: any) {
            console.log(err)
            Alert.alert('Registration failed', err.response?.data?.message || 'Please check your details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{flex: 1, backgroundColor: '#fff'}}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
                <Text style={s.title}>Create Account ✨</Text>
                <Text style={s.subtitle}>Join us and start shopping today</Text>

                <View style={s.row}>
                    <View style={[s.inputBox, {flex: 1, marginRight: 6}]}>
                        <Ionicons name="person-outline" size={20} color="#6b7280" style={s.icon}/>
                        <TextInput
                            placeholder="First name"
                            style={s.input}
                            value={form.firstName}
                            onChangeText={(v) => handleChange('firstName', v)}
                        />
                    </View>
                    <View style={[s.inputBox, {flex: 1, marginLeft: 6}]}>
                        <TextInput
                            placeholder="Last name"
                            style={s.input}
                            value={form.lastName}
                            onChangeText={(v) => handleChange('lastName', v)}
                        />
                    </View>
                </View>

                <View style={s.inputBox}>
                    <Ionicons name="mail-outline" size={20} color="#6b7280" style={s.icon}/>
                    <TextInput
                        placeholder="Email"
                        keyboardType="email-address"
                        style={s.input}
                        value={form.email}
                        onChangeText={(v) => handleChange('email', v)}
                    />
                </View>

                <View style={s.inputBox}>
                    <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={s.icon}/>
                    <TextInput
                        placeholder="Password"
                        secureTextEntry
                        style={s.input}
                        value={form.password}
                        onChangeText={(v) => handleChange('password', v)}
                    />
                </View>

                <View style={s.inputBox}>
                    <Ionicons name="call-outline" size={20} color="#6b7280" style={s.icon}/>
                    <TextInput
                        placeholder="Phone number"
                        keyboardType="phone-pad"
                        style={s.input}
                        value={form.phone}
                        onChangeText={(v) => handleChange('phone', v)}
                    />
                </View>

                <View style={s.inputBox}>
                    <Ionicons name="home-outline" size={20} color="#6b7280" style={s.icon}/>
                    <TextInput
                        placeholder="City"
                        style={s.input}
                        value={form.city}
                        onChangeText={(v) => handleChange('city', v)}
                    />
                </View>

                <View style={s.inputBox}>
                    <Ionicons name="earth-outline" size={20} color="#6b7280" style={s.icon}/>
                    <TextInput
                        placeholder="Country"
                        style={s.input}
                        value={form.country}
                        onChangeText={(v) => handleChange('country', v)}
                    />
                </View>

                <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff"/> : <Text style={s.btnText}>Register</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/login')}>
                    <Text style={s.link}>Already have an account? Login</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: {flexGrow: 1, justifyContent: 'center', padding: 24},
    title: {fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 8},
    subtitle: {color: '#6b7280', marginBottom: 24},
    row: {flexDirection: 'row', marginBottom: 16},
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    icon: {marginRight: 6},
    input: {flex: 1, height: 44, fontSize: 15},
    btn: {
        backgroundColor: '#2563eb',
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 8,
    },
    btnText: {color: '#fff', fontWeight: '700', fontSize: 16},
    link: {textAlign: 'center', marginTop: 18, color: '#2563eb', fontWeight: '600'},
});
