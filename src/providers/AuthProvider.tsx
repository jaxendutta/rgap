'use client';

import { createContext, useContext } from 'react';
import { User } from '@/types/database';

interface AuthContextType {
    user: Partial<User> | null;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
    children,
    initialUser,
}: {
    children: React.ReactNode;
    initialUser: Partial<User> | null;
}) {
    return (
        <AuthContext.Provider
            value={{
                user: initialUser,
                isAuthenticated: !!initialUser
            }}
        >
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
