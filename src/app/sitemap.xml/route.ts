import { NextResponse } from 'next/server';
import { LAST_UPDATED } from '@/constants/data';

export const revalidate = 86400; // Cache sitemap for 24 hours

export interface StaticPage {
    url: string;
    priority: string;
    changefreq: string;
}

export const STATIC_PAGES: StaticPage[] = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/search', priority: '0.8', changefreq: 'weekly' },
    { url: '/search/popular', priority: '0.7', changefreq: 'weekly' },
    { url: '/recipients', priority: '0.8', changefreq: 'daily' },
    { url: '/institutes', priority: '0.8', changefreq: 'daily' },
    { url: '/docs', priority: '0.7', changefreq: 'monthly' },
    { url: '/docs/intro', priority: '0.6', changefreq: 'monthly' },
    { url: '/docs/search', priority: '0.6', changefreq: 'monthly' },
    { url: '/docs/analytics', priority: '0.6', changefreq: 'monthly' },
    { url: '/docs/bookmarks', priority: '0.6', changefreq: 'monthly' },
    { url: '/docs/account-setup', priority: '0.6', changefreq: 'monthly' },
    { url: '/docs/terms', priority: '0.5', changefreq: 'monthly' },
    { url: '/docs/privacy', priority: '0.5', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.5', changefreq: 'monthly' },
    { url: '/terms', priority: '0.5', changefreq: 'monthly' },
];

function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function GET(request: Request) {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`).replace(/\/$/, '');
    const lastMod = LAST_UPDATED.toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of STATIC_PAGES) {
        xml += `  <url>\n`;
        xml += `    <loc>${escapeXml(`${baseUrl}${page.url}`)}</loc>\n`;
        xml += `    <lastmod>${escapeXml(lastMod)}</lastmod>\n`;
        xml += `    <changefreq>${escapeXml(page.changefreq)}</changefreq>\n`;
        xml += `    <priority>${escapeXml(page.priority)}</priority>\n`;
        xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        },
    });
}
