import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: '/',
        name: '[ RGAP ] Research Grants Analytics Platform',
        short_name: 'RGAP',
        description: 'Browse Canadian Tri-Agency Council research grants from NSERC, CIHR, and SSHRC',
        start_url: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f1f5f9',
        theme_color: '#ffffff',
        icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
            {
                src: '/screenshots/desktop-home.png',
                sizes: '1280x800',
                type: 'image/png',
                form_factor: 'wide',
                label: 'RGAP home page on desktop',
            },
            {
                src: '/screenshots/mobile-home.png',
                sizes: '390x844',
                type: 'image/png',
                form_factor: 'narrow',
                label: 'RGAP home page on mobile',
            },
        ],
    };
}
