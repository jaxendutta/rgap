// src/app/(dashboard)/search/page.tsx
// Server Component - Fetches filter options server-side

import { db } from '@/lib/db';
import SearchPageClient from './SearchPageClient';
import { DEFAULT_FILTER_STATE } from '@/constants/filters';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Server Component - Fetches filter options from database
 * No API call needed, faster initial load
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
    const resolvedSearchParams = await searchParams;

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

    // Helper to get array from param
    const getArrayParam = (param: string | string[] | undefined): string[] => {
        if (!param) return [];
        return Array.isArray(param) ? param : [param];
    };

    // Helper to get string param
    const getStringParam = (param: string | string[] | undefined): string => {
        if (!param) return '';
        return Array.isArray(param) ? param[0] : param;
    };

    // Parse initial search terms
    const initialSearchTerms = {
        recipient: getStringParam(resolvedSearchParams.recipient),
        institute: getStringParam(resolvedSearchParams.institute),
        grant: getStringParam(resolvedSearchParams.grant),
    };

    // Parse initial filters
    const initialFilters = {
        ...DEFAULT_FILTER_STATE,
        agencies: getArrayParam(resolvedSearchParams.agencies),
        countries: getArrayParam(resolvedSearchParams.countries),
        provinces: getArrayParam(resolvedSearchParams.provinces),
        cities: getArrayParam(resolvedSearchParams.cities),
        dateRange: {
            from: resolvedSearchParams.from
                ? new Date(getStringParam(resolvedSearchParams.from))
                : DEFAULT_FILTER_STATE.dateRange.from,
            to: resolvedSearchParams.to
                ? new Date(getStringParam(resolvedSearchParams.to))
                : DEFAULT_FILTER_STATE.dateRange.to,
        },
        valueRange: {
            min: resolvedSearchParams.min
                ? parseInt(getStringParam(resolvedSearchParams.min))
                : DEFAULT_FILTER_STATE.valueRange.min,
            max: resolvedSearchParams.max
                ? parseInt(getStringParam(resolvedSearchParams.max))
                : DEFAULT_FILTER_STATE.valueRange.max,
        }
    };

    // Pass to Client Component
    return (
        <SearchPageClient
            filterOptions={filterOptions}
            initialSearchTerms={initialSearchTerms}
            initialFilters={initialFilters}
        />
    );
}

export const metadata: Metadata = {
    title: 'Search Grants | RGAP',
    description: 'Search research grants across NSERC, CIHR, and SSHRC',
};
