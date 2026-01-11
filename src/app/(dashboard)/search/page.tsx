// src/app/(dashboard)/search/page.tsx
// Server Component - Fetches filter options server-side

import { db } from '@/lib/db';
import SearchPageClient from './SearchPageClient';

export const dynamic = 'force-dynamic';

/**
 * Server Component - Fetches filter options from database
 * No API call needed, faster initial load
 */
export default async function SearchPage() {
    // Fetch all filter options in parallel
    const [agencies, countries, provinces, cities] = await Promise.all([
        db.query(`
            SELECT DISTINCT org 
            FROM grants 
            WHERE org IS NOT NULL 
            ORDER BY org
        `),
        db.query(`
            SELECT DISTINCT country 
            FROM institutes 
            WHERE country IS NOT NULL 
            ORDER BY country
        `),
        db.query(`
            SELECT DISTINCT province 
            FROM institutes 
            WHERE province IS NOT NULL 
            ORDER BY province
        `),
        db.query(`
            SELECT DISTINCT city 
            FROM institutes 
            WHERE city IS NOT NULL 
            ORDER BY city
        `),
    ]);

    // Transform to simple arrays
    const filterOptions = {
        agencies: agencies.rows.map(r => r.org),
        countries: countries.rows.map(r => r.country),
        provinces: provinces.rows.map(r => r.province),
        cities: cities.rows.map(r => r.city),
    };

    // Pass to Client Component
    return <SearchPageClient filterOptions={filterOptions} />;
}

export const metadata = {
    title: 'Search Grants | RGAP',
    description: 'Search research grants across NSERC, CIHR, and SSHRC',
};
