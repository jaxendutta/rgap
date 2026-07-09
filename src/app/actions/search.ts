'use server';

import { db } from '@/lib/db';

export type SuggestionField = 'recipient' | 'institute';

export interface SearchSuggestion {
    field: SuggestionField;
    original: string;
    suggestion: string;
}

// Name columns worth correcting. Grant titles are long free text, where a
// trigram "did you mean" on a whole title is noise, so we only suggest for the
// recipient/institute name fields — the classic typo case. Both columns have
// GIN trigram indexes (see the baseline migration), so `%` is index-backed.
const TARGETS: { field: SuggestionField; table: string; column: string }[] = [
    { field: 'recipient', table: 'recipients', column: 'legal_name' },
    { field: 'institute', table: 'institutes', column: 'name' },
];

// When a search returns nothing, find the closest existing name via pg_trgm
// similarity so the UI can offer a "Did you mean …?" correction. Returns the
// single best match across the provided name terms, or null if nothing is
// similar enough (pg_trgm's default 0.3 threshold, applied by the `%` operator).
export async function getSearchSuggestion(
    searchTerms: Partial<Record<SuggestionField, string>>
): Promise<SearchSuggestion | null> {
    let best: (SearchSuggestion & { score: number }) | null = null;

    for (const { field, table, column } of TARGETS) {
        const term = searchTerms[field]?.trim();
        if (!term || term.length < 3) continue;

        try {
            const { rows } = await db.query<{ value: string; score: number }>(
                `SELECT ${column} AS value, similarity(${column}, $1) AS score
                 FROM ${table}
                 WHERE ${column} % $1
                 ORDER BY score DESC
                 LIMIT 1`,
                [term]
            );
            const row = rows[0];
            if (
                row?.value &&
                row.value.toLowerCase() !== term.toLowerCase() &&
                (!best || row.score > best.score)
            ) {
                best = { field, original: term, suggestion: row.value, score: row.score };
            }
        } catch (err) {
            console.error(`Search suggestion query failed for ${field}:`, err);
        }
    }

    if (!best) return null;
    return { field: best.field, original: best.original, suggestion: best.suggestion };
}
