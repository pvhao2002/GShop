import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormInput } from '@/components/ui/FormInput';
import { validateLoginCredentials } from '@/utils/validation';
import authService from '@/services/authService';

export default function AdminLoginScreen() {
    const router = useRouter();
    const { setLoading, isLoading, updateAuthState } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [generalError, setGeneralError] = useState('');

    const handleAdminLogin = async () => {
        // Clear previous errors
        setErrors({});
        setGeneralError('');

        // Validate form data
        const validationErrors = validateLoginCredentials({ email, password });
        if (validationErrors.length > 0) {
            const errorMap: { [key: string]: string } = {};
            validationErrors.forEach(error => {
                if (error.toLowerCase().includes('email')) {
                    errorMap.email = error;
                } else if (error.toLowerCase().includes('password')) {
                    errorMap.password = error;
                }
            });
            setErrors(errorMap);
            return;
        }

        setLoading(true);
        try {
            // Login using auth service
            const response = await authService.login({ email, password });
            
            // Validate admin role
            if (response.user.role !== 'admin') {
                setGeneralError('Access denied. Admin credentials required.');
                await authService.logout(); // Clear any stored auth data
                return;
            }

            // Update auth state with admin user
            updateAuthState(response.user, response.token, response.refreshToken);
            
            // Navigate to admin dashboard
            router.replace('/(admin)');
        } catch (err: any) {
            setGeneralError(err.message || 'Admin login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToCustomerLogin = () => {
        router.replace('/login');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.container}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Image
                                source={require('../assets/images/react-logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <Text style={styles.brand}>FASHIONLY</Text>
                            <Text style={styles.adminTitle}>Admin Portal</Text>
                            <Text style={styles.tagline}>Manage your store with ease 🛠️</Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}

                            <FormInput
                                label="Admin Email"
                                placeholder="Enter your admin email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={errors.email}
                                isRequired
                            />

                            <FormInput
                                label="Admin Password"
                                placeholder="Enter your admin password"
                                value={password}
                                onChangeText={setPassword}
                                isPassword
                                autoCapitalize="none"
                                error={errors.password}
                                isRequired
                            />

                            <TouchableOpacity
                                style={[styles.button, isLoading && styles.buttonDisabled]}
                                onPress={handleAdminLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.buttonText}>Admin Sign In</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={handleBackToCustomerLogin}
                            >
                                <Text style={styles.backButtonText}>← Back to Customer Login</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Security Notice */}
                        <View style={styles.securityNotice}>
                            <Text style={styles.securityText}>
                                🔒 This is a secure admin portal. Only authorized personnel should access this area.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    keyboardView: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: 32,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        backgroundColor: '#F8F9FA',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
        marginTop: 32,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 16,
    },
    brand: {
        fontSize: 28,
        fontWeight: '800',
        color: '#000000',
        letterSpacing: 1.5,
        fontFamily: 'Poppins',
    },
    adminTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4A5D23',
        marginTop: 4,
        fontFamily: 'Poppins',
    },
    tagline: {
        fontSize: 16,
        color: '#666666',
        marginTop: 8,
        fontFamily: 'Inter',
    },
    form: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    button: {
        marginTop: 24,
        backgroundColor: '#4A5D23',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
        fontFamily: 'Poppins',
    },
    backButton: {
        marginTop: 16,
        paddingVertical: 12,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#666666',
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    generalError: {
        color: '#D32F2F',
        marginBottom: 16,
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Inter',
        backgroundColor: '#FFEBEE',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    securityNotice: {
        marginTop: 32,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#E8F5E8',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    securityText: {
        fontSize: 12,
        color: '#2E7D32',
        textAlign: 'center',
        fontFamily: 'Inter',
        lineHeight: 16,
    },
});