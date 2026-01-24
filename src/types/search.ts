// src/types/search.ts

// The categories available for searching/filtering
export type SearchCategory = 'grant' | 'recipient' | 'institute';

// The shape of a popular search result
export interface PopularSearch {
    text: string;
    count: number;
    category: SearchCategory;
}

// Type for your specific filter state (frontend only)
export interface FilterState {
    dateRange: {
        from: Date | undefined;
        to: Date | undefined;
    };
    category: SearchCategory;
    // ... add other UI-specific filters here
}

export interface SearchHistoryItem {
    id: number;
    search_query: string;
    filters: Record<string, any>;
    result_count: number;
    searched_at: string;
}