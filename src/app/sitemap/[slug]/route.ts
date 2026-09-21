import { NextResponse } from 'next/server';
import { notFound } from 'next/navigation';
import { LAST_UPDATED } from '@/constants/data';
import { STATIC_PAGES } from '@/app/sitemap.xml/route';

export const revalidate = 86400; // Cache static sitemap for 24 hours

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

    // Only static sitemap is supported; individual recipient and institute chunks
    // have been retired to prevent search crawlers from overloading serverless functions.
    if (cleanSlug !== 'static') {
        return notFound();
    }

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
