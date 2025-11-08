import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SupportScreen() {
    const router = useRouter();
    const [expanded, setExpanded] = useState<number | null>(null);
    const [message, setMessage] = useState('');

    const faqs = [
        {
            q: 'How can I track my order?',
            a: 'Go to “My Orders” > select an order > and view its tracking status. You’ll see updates in real time.',
        },
        {
            q: 'How do I return or exchange an item?',
            a: 'Contact our support team within 7 days of delivery. Items must be unused and in original packaging.',
        },
        {
            q: 'Which payment methods are supported?',
            a: 'We currently support Visa, MasterCard, VNPay, and MoMo Wallet for online payments.',
        },
        {
            q: 'I forgot my password. How can I reset it?',
            a: 'Tap “Forgot password” on the login screen and follow the instructions to reset your account password.',
        },
    ];

    const handleSubmit = () => {
        if (!message.trim()) {
            Alert.alert('Error', 'Please enter your feedback before submitting.');
            return;
        }
        Alert.alert('Thank you!', 'Your feedback has been sent to our support team.');
        setMessage('');
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#f9fafb' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={s.header}>
                    <Ionicons name="help-buoy-outline" size={50} color="#2563eb" />
                    <Text style={s.title}>Help & Support</Text>
                    <Text style={s.subtitle}>We’re here to help you anytime ✨</Text>
                </View>

                {/* Contact Info */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>📞 Contact Us</Text>
                    <TouchableOpacity
                        style={s.row}
                        onPress={() => Linking.openURL('mailto:support@gshop.vn')}
                    >
                        <Ionicons name="mail-outline" size={22} color="#2563eb" />
                        <Text style={s.linkText}>support@gshop.vn</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={s.row}
                        onPress={() => Linking.openURL('tel:+84901234567')}
                    >
                        <Ionicons name="call-outline" size={22} color="#2563eb" />
                        <Text style={s.linkText}>+84 901 234 567</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={s.row}
                        onPress={() => Linking.openURL('https://www.gshop.vn')}
                    >
                        <Ionicons name="globe-outline" size={22} color="#2563eb" />
                        <Text style={s.linkText}>www.gshop.vn</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQ Section */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>💡 Frequently Asked Questions</Text>
                    {faqs.map((item, index) => (
                        <View key={index} style={s.faqItem}>
                            <TouchableOpacity
                                style={s.faqHeader}
                                onPress={() => setExpanded(expanded === index ? null : index)}
                            >
                                <Text style={s.faqQuestion}>{item.q}</Text>
                                <Ionicons
                                    name={expanded === index ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color="#6b7280"
                                />
                            </TouchableOpacity>
                            {expanded === index && (
                                <Text style={s.faqAnswer}>{item.a}</Text>
                            )}
                        </View>
                    ))}
                </View>

                {/* Feedback Section */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>✉️ Send Feedback</Text>
                    <Text style={s.paragraph}>
                        Have an issue, suggestion, or idea to improve our app? Write it below — we’d love to
                        hear from you!
                    </Text>
                    <TextInput
                        placeholder="Write your message here..."
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        style={s.input}
                    />
                    <TouchableOpacity style={s.btn} onPress={handleSubmit}>
                        <Ionicons name="send-outline" size={18} color="#fff" />
                        <Text style={s.btnText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 50,
    },
    header: { alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 8 },
    subtitle: { color: '#6b7280', marginTop: 4 },

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
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    linkText: { color: '#2563eb', fontSize: 15 },
    paragraph: { color: '#374151', marginBottom: 10, lineHeight: 20, fontSize: 14 },

    // FAQ
    faqItem: {
        borderTopWidth: 1,
        borderColor: '#f3f4f6',
        paddingVertical: 10,
    },
    faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    faqQuestion: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1, marginRight: 8 },
    faqAnswer: { color: '#4b5563', marginTop: 6, lineHeight: 20, fontSize: 14 },

    // Feedback
    input: {
        backgroundColor: '#f3f4f6',
        borderRadius: 10,
        padding: 10,
        textAlignVertical: 'top',
        minHeight: 90,
        marginTop: 8,
        marginBottom: 12,
    },
    btn: {
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 30,
        gap: 8,
    },
    btnText: { color: '#fff', fontWeight: '700' },

    backBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    backText: { color: '#2563eb', fontWeight: '600', marginLeft: 6 },
});
