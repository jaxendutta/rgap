// src/types/search.ts
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import { Entity, Grant, EntityModel } from "./models";
import {
    Calendar,
    DollarSign,
    BookMarked,
    Users,
    Hash,
    LucideIcon,
} from "lucide-react";

export interface SortConfig<T> {
    field: keyof T;
    direction: "asc" | "desc";
}

export interface SortOption<T> {
    label: string;
    icon: LucideIcon;
    field: keyof T;
}

export function getSortOptions<T extends EntityModel>(
    entityModel: T | keyof Entity,
): SortOption<T>[] {
    switch (entityModel) {
        case "grant":
            return [
                {
                    label: "Date",
                    icon: Calendar,
                    field: "agreement_start_dat" as keyof T,
                },
                {
                    label: "Value",
                    icon: DollarSign,
                    field: "agreement_value" as keyof T,
                },
            ];

        case "recipient":
            return [
                {
                    label: "Funding",
                    icon: DollarSign,
                    field: "total_funding" as keyof T,
                },
                {
                    label: "Grants",
                    icon: BookMarked,
                    field: "grant_count" as keyof T,
                },
                {
                    label: "Latest",
                    icon: Calendar,
                    field: "latest_grant_date" as keyof T,
                },
            ];

        case "institute":
            return [
                {
                    label: "Funding",
                    icon: DollarSign,
                    field: "total_funding" as keyof T,
                },
                {
                    label: "Recipients",
                    icon: Users,
                    field: "recipient_count" as keyof T,
                },
                {
                    label: "Grants",
                    icon: BookMarked,
                    field: "grant_count" as keyof T,
                },
            ];

        case "search":
            return [
                {
                    label: "Date",
                    icon: Calendar,
                    field: "created_at" as keyof T,
                },
                {
                    label: "Results",
                    icon: Hash,
                    field: "result_count" as keyof T,
                },
            ];
        default:
            return [];
    }
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
