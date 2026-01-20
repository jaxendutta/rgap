'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types/database';
import { checkAuth } from '@/app/actions/auth';

interface AuthContextType {
    user: Partial<User> | null;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
    children,
    initialUser
}: {
    children: ReactNode;
    initialUser: Partial<User> | null
}) {
    const [user, setUser] = useState<Partial<User> | null>(initialUser);
    const [isLoading, setIsLoading] = useState(false);

    const refreshUser = async () => {
        setIsLoading(true);
        try {
            const result = await checkAuth();
            if (result.user) {
                setUser(result.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
