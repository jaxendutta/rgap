// src/types/search.ts
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import { ResearchGrant } from "./models";

export type SortDirection = "asc" | "desc";

// Base sort configuration that includes all possible fields
export interface BaseSortConfig {
    direction: SortDirection;
}

// Grant-specific sort config
export interface GrantSortConfig extends BaseSortConfig {
    field: "date" | "value";
}

// History-specific sort config
export interface HistorySortConfig extends BaseSortConfig {
    field: "date" | "results";
}

// Generic sort config for broader use
export interface SortConfig extends BaseSortConfig {
    field: "date" | "value" | "results";
}

// Grant-specific search params
export interface GrantSearchParams {
    searchTerms: {
        recipient: string;
        institute: string;
        grant: string;
    };
    filters: typeof DEFAULT_FILTER_STATE;
    sortConfig: GrantSortConfig;
    pagination?: {
        page: number;
        pageSize: number;
    };
}

// History search params
export interface HistorySearchParams {
    sortConfig: HistorySortConfig;
    // other history-specific fields
}

export interface SearchResponseMetadata {
    count: number;
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    filters: typeof DEFAULT_FILTER_STATE;
    searchTerms: {
        recipient: string;
        institute: string;
        grant: string;
    };
}

export interface SearchResponse {
    message: string;
    data: ResearchGrant[];
    metadata: SearchResponseMetadata;
}

export type ChartType = "line" | "bar";
export type ProfileTab = "grants" | "analytics" | "recipients";
export type ChartMetric = "funding" | "grants" | "counts";
