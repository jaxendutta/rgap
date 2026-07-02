// src/app/actions/analytics.ts
'use server';

import { db } from '@/lib/db';
import { unstable_cache } from 'next/cache';
import { SearchCategory, PopularSearch } from '@/types/search';

// Plain SQL TRIM() only strips literal ASCII space (U+0020). Search terms
// typed via an East-Asian IME can end up with a full-width space
// (U+3000, IDEOGRAPHIC SPACE) or another Unicode space separator instead,
// which TRIM() leaves untouched -- "university" and "university" with a
// trailing U+3000 would otherwise group as two different popular
// searches. JS's .trim() already handles this range for new saves
// (history.ts); this covers aggregating whatever's already in the table.
//
// Built from Postgres's own \uXXXX regex escapes (parsed by Postgres's
// regex engine, not JavaScript -- the double backslash below sends the
// literal four characters "\", "u", "3", "0", "0", "0" etc. to Postgres,
// not a JS Unicode escape) so the source file only ever contains plain
// ASCII, never an actual invisible character.
const UNICODE_WHITESPACE_CLASS =
    '\\s\\u00A0\\u1680\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u3000\\uFEFF';
const trimExpr = (col: string) =>
    `regexp_replace(${col}, '^[${UNICODE_WHITESPACE_CLASS}]+|[${UNICODE_WHITESPACE_CLASS}]+$', '', 'g')`;

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

                // trimExpr() in both SELECT and GROUP BY: search terms saved
                // with incidental surrounding whitespace (e.g. a trailing
                // space typed into the search bar) would otherwise group as
                // a separate "popular search" from the identical trimmed
                // term.
                if (category === 'recipient') {
                    const trimmed = trimExpr(`filters->>'recipient'`);
                    query = `SELECT ${trimmed} as text, COUNT(*) as count FROM search_history WHERE filters->>'recipient' IS NOT NULL AND ${trimmed} != '' GROUP BY ${trimmed} ORDER BY count DESC LIMIT $1`;
                } else if (category === 'institute') {
                    const trimmed = trimExpr(`filters->>'institute'`);
                    query = `SELECT ${trimmed} as text, COUNT(*) as count FROM search_history WHERE filters->>'institute' IS NOT NULL AND ${trimmed} != '' GROUP BY ${trimmed} ORDER BY count DESC LIMIT $1`;
                } else {
                    const trimmed = trimExpr('search_query');
                    query = `SELECT ${trimmed} as text, COUNT(*) as count FROM search_history WHERE search_query IS NOT NULL AND ${trimmed} != '' GROUP BY ${trimmed} ORDER BY count DESC LIMIT $1`;
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
                        LEFT JOIN institutes i ON r.institute_id = i.institute_id
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
                        LEFT JOIN institutes i ON r.institute_id = i.institute_id
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
                        LEFT JOIN institutes i ON r.institute_id = i.institute_id
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
