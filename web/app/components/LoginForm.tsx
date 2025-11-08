'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import './LoginForm.css';
import apiClient from "@/api/apiClient";
import {API_ENDPOINTS} from "@/constants/api";
import Spinner from "@/app/components/Spinner";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {email, password});
            const {token, refreshToken, email: userEmail, role} = res.data;

            // ✅ Lưu token vào localStorage
            localStorage.setItem('auth_token', token);
            localStorage.setItem('refresh_token', refreshToken);
            localStorage.setItem('user_email', userEmail);
            localStorage.setItem('user_role', role);

            router.push('/admin');
        } catch (err: any) {
            console.error('Login failed:', err);
            if (err.response?.status === 401) {
                setError('Email hoặc mật khẩu không đúng.');
            } else {
                setError('Lỗi hệ thống, vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && <Spinner />}
            <div className="login-card">
                <h1 className="brand">GShop Admin</h1>
                <p className="subtitle">Sign in to manage your fashion store 👗</p>

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="admin@gshop.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="error">{error}</p>}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Login'}
                    </button>

                    <p className="note">Fashion & Style Management Dashboard 💃</p>
                </form>
            </div>
        </>
    );
}
