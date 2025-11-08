'use client';

import LoginForm from '../components/LoginForm';

export default function LoginPage() {
    return (
        <div className="login-page">
            <div className="login-overlay">
                <LoginForm />
            </div>
        </div>
    );
}
