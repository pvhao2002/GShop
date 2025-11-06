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

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [generalError, setGeneralError] = useState('');

    const handleLogin = async () => {
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

        try {
            await login(email, password);
            router.replace('/(user)');
        } catch (err: any) {
            setGeneralError(err.message || 'Login failed. Please try again.');
        }
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
                        {/* Logo + Title */}
                        <View style={styles.header}>
                            <Image
                                source={require('../assets/images/react-logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <Text style={styles.brand}>FASHIONLY</Text>
                            <Text style={styles.tagline}>Style that speaks for you 👗</Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}

                            <FormInput
                                label="Email"
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={errors.email}
                                isRequired
                            />

                            <FormInput
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                isPassword
                                autoCapitalize="none"
                                error={errors.password}
                                isRequired
                            />

                            <TouchableOpacity
                                style={styles.forgotButton}
                                onPress={() => router.push('/forgot-password')}
                            >
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, isLoading && styles.buttonDisabled]}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.buttonText}>Sign In</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.registerContainer}>
                                <Text style={styles.registerText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/register')}>
                                    <Text style={styles.registerLink}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.adminContainer}>
                                <TouchableOpacity onPress={() => router.push('/admin-login')}>
                                    <Text style={styles.adminLink}>Admin Portal →</Text>
                                </TouchableOpacity>
                            </View>
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
        backgroundColor: '#FFFFFF',
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
        backgroundColor: '#FFFFFF',
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
        borderColor: '#F5F5F5',
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginTop: 8,
        marginBottom: 8,
    },
    forgotText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    button: {
        marginTop: 24,
        backgroundColor: '#000000',
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
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    registerText: {
        color: '#666666',
        fontSize: 16,
        fontFamily: 'Inter',
    },
    registerLink: {
        color: '#000000',
        fontWeight: '600',
        fontSize: 16,
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
    adminContainer: {
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    adminLink: {
        color: '#4A5D23',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
});
