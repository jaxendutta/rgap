// src/app/actions/analytics.ts
'use server';

import { db } from '@/lib/db';
import { unstable_cache } from 'next/cache';
import { SearchCategory, PopularSearch } from '@/types/search';

/**
 * Fetches popular search terms based on category.
 */
export const getPopularSearches = async (
    category: SearchCategory = 'recipient',
    limit: number = 5
): Promise<PopularSearch[]> => {
    return unstable_cache(
        async () => {
            try {
                let query = '';
                const params: any[] = [limit];

                if (category === 'recipient') {
                    query = `SELECT filters->>'recipient' as text, COUNT(*) as count FROM search_history WHERE filters->>'recipient' IS NOT NULL AND (filters->>'recipient') != '' GROUP BY filters->>'recipient' ORDER BY count DESC LIMIT $1`;
                } else if (category === 'institute') {
                    query = `SELECT filters->>'institute' as text, COUNT(*) as count FROM search_history WHERE filters->>'institute' IS NOT NULL AND (filters->>'institute') != '' GROUP BY filters->>'institute' ORDER BY count DESC LIMIT $1`;
                } else {
                    query = `SELECT search_query as text, COUNT(*) as count FROM search_history WHERE search_query IS NOT NULL AND search_query != '' GROUP BY search_query ORDER BY count DESC LIMIT $1`;
                }
                const result = await db.query(query, params);
                return result.rows.map((row) => ({ text: row.text, count: parseInt(row.count), category }));
            } catch (error) {
                console.error('Failed to fetch popular searches:', error);
                return [];
            }
        },
        [`popular-searches-${category}-${limit}`],
        { revalidate: 3600, tags: ['analytics'] }
    )();
};

export type AggregatedTrendPoint = {
    year: number;
    category: string;
    funding: number;
    count: number;
};

export async function getAggregatedTrends(
    entityType: 'recipient' | 'institute',
    ids: number[],
    groupBy: string
): Promise<AggregatedTrendPoint[]> {
    // Empty IDs means "Global Mode" - fetch everything
    const isGlobal = ids.length === 0;
    const cacheKey = `trend-agg-v5-${entityType}-${groupBy}-${isGlobal ? 'ALL' : ids.sort().join('-')}`;

    return unstable_cache(
        async () => {
            try {
                const idColumn = entityType === 'recipient' ? 'r.recipient_id' : 'i.institute_id';

                let groupColumn = '';
                switch (groupBy) {
                    case 'org': groupColumn = 'g.org'; break;
                    case 'city': groupColumn = 'i.city'; break;
                    case 'province': groupColumn = 'i.province'; break;
                    case 'country': groupColumn = 'i.country'; break;
                    case 'recipient': groupColumn = 'r.legal_name'; break;
                    case 'institute': groupColumn = 'i.name'; break;
                    case 'program': groupColumn = 'p.prog_title_en'; break;
                    case 'year': groupColumn = "'Total'"; break;
                    default: groupColumn = 'g.org';
                }

                // Dynamic filtering
                const whereClause = isGlobal
                    ? `g.agreement_start_date IS NOT NULL`
                    : `${idColumn} = ANY($1) AND g.agreement_start_date IS NOT NULL`;

                const queryParams = isGlobal ? [] : [ids];

                let query = '';

                // OPTIMIZATION: If grouping by Year only, we don't need the Top 50 calculation
                if (groupBy === 'year') {
                    query = `
                        SELECT 
                            EXTRACT(YEAR FROM g.agreement_start_date)::int as year,
                            'Total' as category,
                            SUM(g.agreement_value) as funding,
                            COUNT(*) as count
                        FROM grants g
                        JOIN recipients r ON g.recipient_id = r.recipient_id
                        JOIN institutes i ON r.institute_id = i.institute_id
                        WHERE ${whereClause}
                        GROUP BY year
                        ORDER BY year ASC
                    `;
                } else {
                    // For Categories: We need to find the Top 50 first, then group everything else as "Other"
                    // This ensures we don't return 10,000 messy lines
                    const topCatsQuery = `
                        SELECT ${groupColumn} as category
                        FROM grants g
                        JOIN recipients r ON g.recipient_id = r.recipient_id
                        JOIN institutes i ON r.institute_id = i.institute_id
                        LEFT JOIN programs p ON g.prog_id = p.prog_id
                        WHERE ${whereClause}
                        GROUP BY category
                        ORDER BY SUM(g.agreement_value) DESC
                        LIMIT 50
                    `;

                    query = `
                        WITH TopCategories AS (${topCatsQuery})
                        SELECT 
                            EXTRACT(YEAR FROM g.agreement_start_date)::int as year,
                            CASE 
                                WHEN ${groupColumn} IN (SELECT category FROM TopCategories) THEN COALESCE(${groupColumn}, 'Unknown')
                                ELSE 'Other' 
                            END as category,
                            SUM(g.agreement_value) as funding,
                            COUNT(*) as count
                        FROM grants g
                        JOIN recipients r ON g.recipient_id = r.recipient_id
                        JOIN institutes i ON r.institute_id = i.institute_id
                        LEFT JOIN programs p ON g.prog_id = p.prog_id
                        WHERE ${whereClause}
                        GROUP BY 1, 2
                        ORDER BY year ASC
                    `;
                }

                const result = await db.query(query, queryParams);

                return result.rows.map(row => ({
                    year: row.year,
                    category: row.category,
                    funding: Number(row.funding),
                    count: Number(row.count)
                }));

            } catch (error) {
                console.error('Failed to fetch aggregated trends:', error);
                return [];
            }
        },
        [cacheKey],
        { revalidate: 3600, tags: ['analytics', 'grants'] }
    )();
}
