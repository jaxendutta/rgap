import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = (
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    ).replace(/\/$/, '');

    const aggressiveBots = [
        'Bytespider',
        'ClaudeBot',
        'Anthropic-AI',
        'GPTBot',
        'ChatGPT-User',
        'CCBot',
        'cohere-ai',
        'PerplexityBot',
        'AhrefsBot',
        'SemrushBot',
        'DotBot',
        'Amazonbot',
        'Applebot-Extended',
    ];

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/recipients', '/institutes', '/search', '/docs'],
                disallow: [
                    '/api/',
                    '/account',
                    '/bookmarks',
                    '/auth',
                    '/forgot-password',
                    '/reset-password',
                    '/recipients/',
                    '/institutes/',
                    '/*?*tab=*',
                    '/*?*page=*',
                    '/*?*sort=*',
                    '/*?*dir=*',
                ],
            },
            {
                userAgent: aggressiveBots,
                disallow: ['/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
