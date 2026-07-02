'use client';

import { useEffect } from 'react';

// Registers public/sw.js (static-asset caching only, see that file for the
// caching strategy). Renders nothing -- side effect only.
export function ServiceWorkerRegistration() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch((error) => {
                console.error('Service worker registration failed:', error);
            });
        }
    }, []);

    return null;
}
