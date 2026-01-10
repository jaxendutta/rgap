'use client';

import { createContext, useContext, useState, useTransition } from 'react';
import { User } from '@/types/database';
import { logoutAction } from '@/app/actions/auth';

interface AuthContextType {
    user: Partial<User> | null;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
    children,
    initialUser,
}: {
    children: React.ReactNode;
    initialUser: Partial<User> | null;
}) {
    const [user, setUser] = useState<Partial<User> | null>(initialUser);
    const [isPending, startTransition] = useTransition();

    const logout = async () => {
        // 1. Immediate Client Update (Optimistic)
        setUser(null);

        // 2. Call Server Action to destroy session & cookie
        startTransition(async () => {
            await logoutAction();
        });
    };

    return (
        <AuthContext.Provider value={{ user, logout, isLoading: isPending }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
