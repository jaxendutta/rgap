// src/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/providers/AuthProvider'; // The component we defined earlier
import { NotificationProvider } from '@/components/features/notifications/NotificationProvider';
import { User } from '@/types/database';

export function Providers({
    children,
    initialUser
}: {
    children: React.ReactNode;
    initialUser: Partial<User> | null; // <--- Pass this in!
}) {
    // 1. Stable Query Client (Your existing code)
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        // 2. Wrap everything together
        <QueryClientProvider client={queryClient}>
            {/* 3. Inject Server Data into Client Context */}
            <AuthProvider initialUser={initialUser}>
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
