import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LAST_UPDATED } from '@/constants/data';

export const revalidate = 86400; // Cache sitemap index for 24 hours

const CHUNK_SIZE = 10000;

export async function GET() {
    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rgap.ca');
    const lastMod = LAST_UPDATED.toISOString();

    let recipientCount = 0;
    let instituteCount = 0;

    try {
        const [recRes, instRes] = await Promise.all([
            db.query<{ count: string }>('SELECT COUNT(*)::text as count FROM recipients'),
            db.query<{ count: string }>('SELECT COUNT(*)::text as count FROM institutes'),
        ]);
        recipientCount = parseInt(recRes.rows[0]?.count || '0', 10);
        instituteCount = parseInt(instRes.rows[0]?.count || '0', 10);
    } catch (error) {
        console.error('Error fetching entity counts for sitemap index:', error);
    }

    const recipientChunks = Math.max(1, Math.ceil(recipientCount / CHUNK_SIZE));
    const instituteChunks = Math.max(1, Math.ceil(instituteCount / CHUNK_SIZE));

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static sitemap
    xml += `  <sitemap>\n`;
    xml += `    <loc>${baseUrl}/sitemap/static.xml</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `  </sitemap>\n`;

    // Recipient sitemaps
    for (let i = 1; i <= recipientChunks; i++) {
        xml += `  <sitemap>\n`;
        xml += `    <loc>${baseUrl}/sitemap/recipients-${i}.xml</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `  </sitemap>\n`;
    }

    // Institute sitemaps
    for (let i = 1; i <= instituteChunks; i++) {
        xml += `  <sitemap>\n`;
        xml += `    <loc>${baseUrl}/sitemap/institutes-${i}.xml</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `  </sitemap>\n`;
    }

    xml += `</sitemapindex>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        },
    });
}
