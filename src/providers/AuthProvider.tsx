// src/providers/AuthProvider.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/database';
import { logoutAction } from '@/app/actions/auth';

interface AuthContextType {
    user: Partial<User> | null;
    isLoading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
    children,
    initialUser
}: {
    children: React.ReactNode;
    initialUser: Partial<User> | null;
}) {
    const [user, setUser] = useState<Partial<User> | null>(initialUser);

    // Optimistic logout
    const logout = async () => {
        setUser(null);
        await logoutAction();
    };

    return (
        <AuthContext.Provider value={{ user, isLoading: false, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
