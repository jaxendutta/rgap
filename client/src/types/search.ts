// src/types/search.ts
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import { Grant } from "./models";

export interface SortConfig<T> {
    field: keyof T;
    direction: "asc" | "desc";
}

// Grant-specific search params
export interface GrantSearchParams {
    searchTerms: {
        recipient: string;
        institute: string;
        grant: string;
    };
    filters: typeof DEFAULT_FILTER_STATE;
    sortConfig: SortConfig<Grant>;
    pagination?: {
        page: number;
        pageSize: number;
    };
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
    data: Grant[];
    metadata: SearchResponseMetadata;
}

export type ChartType = "line" | "bar";
export type ProfileTab = "grants" | "analytics" | "recipients";
export type ChartMetric = "funding" | "grants" | "counts";
