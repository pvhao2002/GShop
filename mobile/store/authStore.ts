import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    token?: string; // JWT token nếu cần
    refreshToken?: string;
    firstName?: string;
    lastName?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    login: (user: User) => void;
    logout: () => void;
    isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            login: (user) => {
                set({user, token: user.token || null});
            },

            logout: () => {
                set({user: null, token: null});
            },

            isLoggedIn: () => !!get().token,
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
