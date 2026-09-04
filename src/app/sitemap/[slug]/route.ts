import { NextResponse } from 'next/server';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { LAST_UPDATED } from '@/constants/data';

export const revalidate = 86400; // Cache individual sitemap chunks for 24 hours

const CHUNK_SIZE = 10000;

interface StaticPage {
    url: string;
    priority: string;
    changefreq: string;
}

const STATIC_PAGES: StaticPage[] = [
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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const cleanSlug = slug.endsWith('.xml') ? slug.slice(0, -4) : slug;

    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`).replace(/\/$/, '');
    const lastMod = LAST_UPDATED.toISOString();

    let urls: Array<{ loc: string; lastmod: string; changefreq?: string; priority?: string }> = [];

    if (cleanSlug === 'static') {
        urls = STATIC_PAGES.map((page) => ({
            loc: `${baseUrl}${page.url}`,
            lastmod: lastMod,
            changefreq: page.changefreq,
            priority: page.priority,
        }));
    } else if (cleanSlug.startsWith('recipients-')) {
        const pageNumStr = cleanSlug.replace('recipients-', '');
        const pageNum = parseInt(pageNumStr, 10);

        if (isNaN(pageNum) || pageNum < 1) {
            return notFound();
        }

        const offset = (pageNum - 1) * CHUNK_SIZE;

        try {
            const result = await db.query<{ recipient_id: number }>(
                'SELECT recipient_id FROM recipients ORDER BY recipient_id ASC LIMIT $1 OFFSET $2',
                [CHUNK_SIZE, offset]
            );

            urls = result.rows.map((row) => ({
                loc: `${baseUrl}/recipients/${row.recipient_id}`,
                lastmod: lastMod,
                changefreq: 'monthly',
                priority: '0.7',
            }));
        } catch (error) {
            console.error(`Error querying recipients for sitemap chunk ${pageNum}:`, error);
        }
    } else if (cleanSlug.startsWith('institutes-')) {
        const pageNumStr = cleanSlug.replace('institutes-', '');
        const pageNum = parseInt(pageNumStr, 10);

        if (isNaN(pageNum) || pageNum < 1) {
            return notFound();
        }

        const offset = (pageNum - 1) * CHUNK_SIZE;

        try {
            const result = await db.query<{ institute_id: number }>(
                'SELECT institute_id FROM institutes ORDER BY institute_id ASC LIMIT $1 OFFSET $2',
                [CHUNK_SIZE, offset]
            );

            urls = result.rows.map((row) => ({
                loc: `${baseUrl}/institutes/${row.institute_id}`,
                lastmod: lastMod,
                changefreq: 'monthly',
                priority: '0.7',
            }));
        } catch (error) {
            console.error(`Error querying institutes for sitemap chunk ${pageNum}:`, error);
        }
    } else {
        return notFound();
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const urlItem of urls) {
        xml += `  <url>\n`;
        xml += `    <loc>${escapeXml(urlItem.loc)}</loc>\n`;
        xml += `    <lastmod>${escapeXml(urlItem.lastmod)}</lastmod>\n`;
        if (urlItem.changefreq) {
            xml += `    <changefreq>${escapeXml(urlItem.changefreq)}</changefreq>\n`;
        }
        if (urlItem.priority) {
            xml += `    <priority>${escapeXml(urlItem.priority)}</priority>\n`;
        }
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
