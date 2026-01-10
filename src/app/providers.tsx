'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import { User } from '@/types/database';

export function Providers({
    children,
    initialUser
}: {
    children: React.ReactNode;
    initialUser: Partial<User> | null;
}) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
            }
        }
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider initialUser={initialUser}>
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
