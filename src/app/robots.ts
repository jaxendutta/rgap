import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rgap.ca');

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/account',
                '/bookmarks',
                '/auth',
                '/forgot-password',
                '/reset-password',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
