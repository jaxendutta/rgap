// src/app/actions/history.ts
'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { revalidateTag } from 'next/cache';

export async function saveSearchHistory(searchTerms: Record<string, string>) {
    try {
        const user = await getCurrentUser();

        // Construct the filters object for the JSONB column
        const filters = {
            recipient: searchTerms.recipient || null,
            institute: searchTerms.institute || null,
        };

        const mainQuery = searchTerms.grant || '';

        // Only save if there's actually something searched
        if (!mainQuery && !filters.recipient && !filters.institute) return;

        // Insert into DB. If user is undefined, we pass null.
        await db.query(
            `INSERT INTO search_history (user_id, search_query, filters, result_count)
       VALUES ($1, $2, $3, $4)`,
            [user?.id || null, mainQuery, JSON.stringify(filters), 0]
        );

        // FIXED: Next.js 16 requires a second argument 'profile'.
        // 'max' uses Stale-While-Revalidate (updates in background).
        // Use { expire: 0 } if you need it to expire immediately.
        revalidateTag('analytics', 'max');

    } catch (error) {
        console.error('Failed to save search history:', error);
    }
}
