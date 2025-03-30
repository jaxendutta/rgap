// src/types/search.ts
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import { Grant, Recipient, Institute, SearchHistory } from "./models";

export interface SortConfig<T> {
    field: keyof T;
    direction: "asc" | "desc";
}

export const DEFAULT_SORT_CONFIG = <T>(entity: T): SortConfig<T> => {
    const entityTypeToSortConfig: Record<string, SortConfig<any>> = {
        Grant: {
            field: "agreement_start_date" as keyof Grant,
            direction: "desc",
        },
        Recipient: {
            field: "latest_grant_date" as keyof Recipient,
            direction: "desc",
        },
        Institute: {
            field: "total_funding" as keyof Institute,
            direction: "desc",
        },
        SearchHistory: {
            field: "created_at" as keyof SearchHistory,
            direction: "desc",
        },
    };

    if (!entity) {
        console.warn("Entity is undefined or null. Returning default sort configuration.");
        return {
            field: "" as keyof T,
            direction: "asc",
        };
    }
    const entityType = (entity as any).constructor.name;
    if (entityTypeToSortConfig[entityType]) {
        return entityTypeToSortConfig[entityType];
    } else {
        console.warn("Unsupported entity type. Returning default sort configuration.");
        return {
            field: "" as keyof T,
            direction: "asc",
        };
    }
};

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
