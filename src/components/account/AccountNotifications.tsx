'use client';
import { useEffect } from 'react';
import { useNotify } from '@/providers/NotificationProvider';
import { useRouter, usePathname } from 'next/navigation';

export default function AccountNotifications({ searchParams }: { searchParams: { verified?: string } }) {
    const { notify } = useNotify();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (searchParams.verified === 'true') {
            notify("Thanks for verifying your account! You are now fully logged in.", "success");
            // Clean up URL
            router.replace(pathname);
        }
    }, [searchParams, notify, router, pathname]);

    return null;
}
