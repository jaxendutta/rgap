// src/app/actions/history.ts
'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { revalidateTag } from 'next/cache';

export async function saveSearchHistory(
    searchTerms: Record<string, string>,
    activeFilters: any,
    resultCount: number
) {
    try {
        const user = await getCurrentUser();
        const mainQuery = searchTerms.grant || '';

        // Construct the filters object for the JSONB column
        // We combine specific search fields (recipient/institute) with the sidebar filters
        const filtersToSave = {
            recipient: searchTerms.recipient || null,
            institute: searchTerms.institute || null,
            // Spread the active filters (agencies, dates, etc.)
            ...activeFilters
        };

        // Only save if there's actually something searched (query or active filters)
        const hasActiveFilters = Object.values(activeFilters).some((val: any) =>
            Array.isArray(val) ? val.length > 0 : !!val
        );

        if (!mainQuery && !searchTerms.recipient && !searchTerms.institute && !hasActiveFilters) {
            return;
        }

        // Insert into DB with the actual result count
        await db.query(
            `INSERT INTO search_history (user_id, search_query, filters, result_count)
             VALUES ($1, $2, $3, $4)`,
            [
                user?.id || null,
                mainQuery, // Stores the Grant Title query
                JSON.stringify(filtersToSave),
                resultCount // Stores the actual count
            ]
        );

        revalidateTag('analytics', 'max');

    } catch (error) {
        console.error('Failed to save search history:', error);
    }
}
