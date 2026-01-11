'use server';

import { db } from '@/lib/db';
import { unstable_cache } from 'next/cache';
import { SearchCategory, PopularSearch } from '@/types/search'; // <--- NEW IMPORT

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
                    query = `
            SELECT 
              filters->>'recipient' as text,
              COUNT(*) as count
            FROM search_history
            WHERE filters->>'recipient' IS NOT NULL
              AND (filters->>'recipient') != ''
            GROUP BY filters->>'recipient'
            ORDER BY count DESC
            LIMIT $1
          `;
                } else if (category === 'institute') {
                    query = `
            SELECT 
              filters->>'institute' as text,
              COUNT(*) as count
            FROM search_history
            WHERE filters->>'institute' IS NOT NULL
              AND (filters->>'institute') != ''
            GROUP BY filters->>'institute'
            ORDER BY count DESC
            LIMIT $1
          `;
                } else {
                    // Grant / Default
                    query = `
            SELECT 
              search_query as text,
              COUNT(*) as count
            FROM search_history
            WHERE search_query IS NOT NULL
              AND search_query != ''
            GROUP BY search_query
            ORDER BY count DESC
            LIMIT $1
          `;
                }

                const result = await db.query(query, params);

                return result.rows.map((row) => ({
                    text: row.text,
                    count: parseInt(row.count),
                    category,
                }));
            } catch (error) {
                console.error('Failed to fetch popular searches:', error);
                return [];
            }
        },
        [`popular-searches-${category}-${limit}`],
        { revalidate: 3600, tags: ['analytics'] }
    )();
};
