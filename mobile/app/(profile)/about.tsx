import React from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';

export default function AboutScreen() {
    const router = useRouter();

    return (
        <ScrollView style={s.container} contentContainerStyle={s.content}>
            <View style={s.header}>
                <Image
                    source={{
                        uri: 'https://cdn-icons-png.flaticon.com/512/869/869636.png',
                    }}
                    style={s.logo}
                />
                <Text style={s.title}>GShop - Fashion E-Commerce App 👗🛍️</Text>
                <Text style={s.subtitle}>Developed with Spring Boot & React Native (Expo SDK 54)</Text>
            </View>

            {/* About Text */}
            <View style={s.card}>
                <Text style={s.sectionTitle}>🌟 About This Project</Text>
                <Text style={s.paragraph}>
                    GShop is a modern e-commerce application designed to bring an elegant and seamless shopping
                    experience to fashion lovers. The system includes:
                </Text>

                <View style={s.list}>
                    <Text style={s.item}>• A mobile app built with React Native (Expo)</Text>
                    <Text style={s.item}>• Secure backend using Spring Boot + MySQL + JWT</Text>
                    <Text style={s.item}>• Role-based authentication (Admin / Customer)</Text>
                    <Text style={s.item}>• Features: product browsing, cart, checkout, and order history</Text>
                </View>
            </View>

            {/* Tech Stack */}
            <View style={s.card}>
                <Text style={s.sectionTitle}>🧩 Tech Stack</Text>
                <View style={s.stackList}>
                    <View style={s.stackItem}>
                        <Ionicons name="logo-react" size={22} color="#61DBFB" />
                        <Text style={s.stackText}>React Native (Expo)</Text>
                    </View>
                    <View style={s.stackItem}>
                        <Ionicons name="logo-xing" size={22} color="#6DB33F" />
                        <Text style={s.stackText}>Spring Boot</Text>
                    </View>
                    <View style={s.stackItem}>
                        <Ionicons name="server-outline" size={22} color="#4B5563" />
                        <Text style={s.stackText}>MySQL Database</Text>
                    </View>
                    <View style={s.stackItem}>
                        <Ionicons name="lock-closed-outline" size={22} color="#2563EB" />
                        <Text style={s.stackText}>JWT Authentication</Text>
                    </View>
                </View>
            </View>

            {/* Credits */}
            <View style={s.card}>
                <Text style={s.sectionTitle}>👨‍💻 Developer</Text>
                <Text style={s.paragraph}>Developed by <Text style={s.bold}>Trần Phương Bình</Text></Text>
                <Text style={s.paragraph}>Email: <Text style={s.link}>binh.dev@example.com</Text></Text>
                <Text style={s.paragraph}>GitHub: <Text style={s.link}>github.com/binhdev</Text></Text>
            </View>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    content: { padding: 16, paddingBottom: 40 },

    header: { alignItems: 'center', marginTop: 10, marginBottom: 16 },
    logo: { width: 80, height: 80, marginBottom: 12 },
    title: { fontSize: 20, fontWeight: '800', color: '#111827', textAlign: 'center' },
    subtitle: { color: '#6b7280', textAlign: 'center', marginTop: 6 },

    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 8 },
    paragraph: { color: '#374151', fontSize: 14, lineHeight: 20, marginBottom: 6 },
    bold: { fontWeight: '700' },
    link: { color: '#2563eb', textDecorationLine: 'underline' },

    list: { marginTop: 6 },
    item: { color: '#374151', marginBottom: 4, fontSize: 14 },

    stackList: { marginTop: 8 },
    stackItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 10 },
    stackText: { color: '#111827', fontSize: 14, fontWeight: '500' },

    footer: { alignItems: 'center', marginTop: 10 },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 30,
        gap: 8,
    },
    btnText: { color: '#fff', fontWeight: '700' },

    backBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 6 },
    backText: { color: '#2563eb', fontWeight: '600' },
});
