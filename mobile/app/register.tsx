import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormInput } from '@/components/ui/FormInput';
import { validateRegistrationData } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';


export default function RegisterScreen() {
    const router = useRouter();
    const { register, isLoading } = useAuthStore();
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [generalError, setGeneralError] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleChange = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        // Clear field-specific error when user starts typing
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: '' }));
        }
    };

    const handleRegister = async () => {
        // Clear previous errors
        setErrors({});
        setGeneralError('');

        const { firstName, lastName, email, password, confirmPassword, phone } = form;

        // Check if terms are accepted
        if (!acceptedTerms) {
            setGeneralError('Please accept the Terms and Conditions to continue');
            return;
        }

        // Check password confirmation
        if (password !== confirmPassword) {
            setErrors({ confirmPassword: 'Passwords do not match' });
            return;
        }

        // Validate form data
        const registrationData: any = {
            firstName,
            lastName,
            email,
            password,
        };

        // Only add phone if it has a value
        if (phone.trim()) {
            registrationData.phone = phone;
        }

        const validationErrors = validateRegistrationData(registrationData);
        if (validationErrors.length > 0) {
            const errorMap: { [key: string]: string } = {};
            validationErrors.forEach(error => {
                if (error.toLowerCase().includes('first name')) {
                    errorMap.firstName = error;
                } else if (error.toLowerCase().includes('last name')) {
                    errorMap.lastName = error;
                } else if (error.toLowerCase().includes('email')) {
                    errorMap.email = error;
                } else if (error.toLowerCase().includes('password')) {
                    errorMap.password = error;
                } else if (error.toLowerCase().includes('phone')) {
                    errorMap.phone = error;
                }
            });
            setErrors(errorMap);
            return;
        }

        try {
            await register(registrationData);
            router.replace('/');
        } catch (err: any) {
            setGeneralError(err.message || 'Registration failed. Please try again.');
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
                        <View style={styles.header}>
                            <Text style={styles.brand}>Join Fashionly</Text>
                            <Text style={styles.tagline}>Your style journey starts here ✨</Text>
                        </View>

                        <View style={styles.form}>
                            {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}

                            <View style={styles.nameRow}>
                                <View style={styles.nameField}>
                                    <FormInput
                                        label="First Name"
                                        placeholder="First name"
                                        value={form.firstName}
                                        onChangeText={v => handleChange('firstName', v)}
                                        error={errors.firstName}
                                        isRequired
                                        autoCapitalize="words"
                                    />
                                </View>
                                <View style={styles.nameField}>
                                    <FormInput
                                        label="Last Name"
                                        placeholder="Last name"
                                        value={form.lastName}
                                        onChangeText={v => handleChange('lastName', v)}
                                        error={errors.lastName}
                                        isRequired
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>

                            <FormInput
                                label="Email"
                                placeholder="Enter your email"
                                value={form.email}
                                onChangeText={v => handleChange('email', v)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={errors.email}
                                isRequired
                            />

                            <FormInput
                                label="Phone Number"
                                placeholder="Enter your phone number (optional)"
                                value={form.phone}
                                onChangeText={v => handleChange('phone', v)}
                                keyboardType="phone-pad"
                                error={errors.phone}
                            />

                            <FormInput
                                label="Password"
                                placeholder="Create a password"
                                value={form.password}
                                onChangeText={v => handleChange('password', v)}
                                isPassword
                                autoCapitalize="none"
                                error={errors.password}
                                isRequired
                            />

                            <FormInput
                                label="Confirm Password"
                                placeholder="Re-enter your password"
                                value={form.confirmPassword}
                                onChangeText={v => handleChange('confirmPassword', v)}
                                isPassword
                                autoCapitalize="none"
                                error={errors.confirmPassword}
                                isRequired
                            />

                            <TouchableOpacity
                                style={styles.termsContainer}
                                onPress={() => setAcceptedTerms(!acceptedTerms)}
                            >
                                <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                                    {acceptedTerms && (
                                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                    )}
                                </View>
                                <Text style={styles.termsText}>
                                    I agree to the{' '}
                                    <Text style={styles.termsLink}>Terms and Conditions</Text>
                                    {' '}and{' '}
                                    <Text style={styles.termsLink}>Privacy Policy</Text>
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, isLoading && styles.buttonDisabled]}
                                onPress={handleRegister}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.buttonText}>Create Account</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.loginContainer}>
                                <Text style={styles.loginText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/login')}>
                                    <Text style={styles.loginLink}>Sign In</Text>
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
        marginBottom: 32,
        marginTop: 32,
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
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: -16, // Compensate for FormInput margin
    },
    nameField: {
        flex: 1,
        marginHorizontal: 4,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 16,
        marginBottom: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#E8E8E8',
        borderRadius: 4,
        marginRight: 12,
        marginTop: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#000000',
        borderColor: '#000000',
    },
    termsText: {
        flex: 1,
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        fontFamily: 'Inter',
    },
    termsLink: {
        color: '#000000',
        fontWeight: '500',
        textDecorationLine: 'underline',
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    loginText: {
        color: '#666666',
        fontSize: 16,
        fontFamily: 'Inter',
    },
    loginLink: {
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
});
