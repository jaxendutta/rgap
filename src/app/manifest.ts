import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'RGAP - Research Grant Analytics Platform',
        short_name: 'RGAP',
        description: 'Browse Canadian research grants from NSERC, CIHR, and SSHRC',
        start_url: '/',
        display: 'standalone',
        background_color: '#f1f5f9',
        theme_color: '#ffffff',
        icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
    };
}
