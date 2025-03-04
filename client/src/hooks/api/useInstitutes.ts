// src/hooks/api/useInstitutes.ts
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import portConfig from "../../../../config/ports.json";

const API = axios.create({
    baseURL:
        process.env.VITE_API_URL ||
        `http://localhost:${portConfig.defaults.server}`,
    timeout: 10000,
});

// Query key factory
export const instituteKeys = {
    all: ["institutes"] as const,
    lists: () => [...instituteKeys.all, "list"] as const,
    list: (filters: any) => [...instituteKeys.lists(), { filters }] as const,
    details: () => [...instituteKeys.all, "detail"] as const,
    detail: (id: number) => [...instituteKeys.details(), id] as const,
    grants: (id: number) => [...instituteKeys.detail(id), "grants"] as const,
    recipients: (id: number) =>
        [...instituteKeys.detail(id), "recipients"] as const,
    search: (term: string) => [...instituteKeys.all, "search", term] as const,
};

// Institute interface
export interface Institute {
    institute_id: number;
    name: string;
    type: string;
    city?: string;
    province?: string;
    country?: string;
    recipient_count?: number;
    grant_count?: number;
    total_funding?: number;
    latest_grant_date?: string;
}

// Institute details response interface
interface InstituteDetailsResponse {
    message: string;
    data: {
        institute_id: number;
        name: string;
        type: string;
        total_recipients: number;
        total_grants: number;
        total_funding: number;
        avg_funding: number;
        first_grant_date?: string;
        latest_grant_date?: string;
        funding_agencies_count?: number;
        city?: string;
        province?: string;
        country?: string;
        recipients: Array<{
            recipient_id: number;
            legal_name: string;
            type: string;
            grants_count: number;
            total_funding: number;
        }>;
        grants: Array<any>; // Using any here as grants have a complex structure
        funding_history: Array<{
            year: number;
            [agency: string]: number;
        }>;
    };
}

// Institute list response interface
interface InstituteListResponse {
    message: string;
    data: Institute[];
    metadata: {
        count: number;
        totalCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}

/**
 * Hook to fetch a paginated list of institutes
 */
export function useInstitutes(page = 1, pageSize = 20) {
    return useQuery({
        queryKey: instituteKeys.list({ page, pageSize }),
        queryFn: async () => {
            const response = await API.get<InstituteListResponse>(
                "/institutes",
                { params: { page, pageSize } }
            );
            return response.data;
        },
    });
}

/**
 * Hook to fetch infinite paginated list of institutes
 */
export function useInfiniteInstitutes(pageSize = 20) {
    return useInfiniteQuery({
        queryKey: instituteKeys.lists(),
        queryFn: async ({ pageParam = 1 }) => {
            const response = await API.get<InstituteListResponse>(
                "/institutes",
                { params: { page: pageParam, pageSize } }
            );
            return response.data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.metadata.page < lastPage.metadata.totalPages) {
                return lastPage.metadata.page + 1;
            }
            return undefined;
        },
    });
}

/**
 * Hook to fetch detailed information about a specific institute
 */
export function useInstituteDetails(id: number | string) {
    // Validate the ID is a valid number
    const isValidId = id !== undefined && id !== "" && !isNaN(Number(id));
    const parsedId = isValidId ? Number(id) : null;
    
    return useQuery({
        queryKey: instituteKeys.detail(parsedId as number),
        queryFn: async () => {
            if (!isValidId) {
                throw new Error("Invalid institute ID");
            }
            const response = await API.get<InstituteDetailsResponse>(`/institutes/${parsedId}`);
            return response.data;
        },
        enabled: isValidId, // Only run query when we have a valid ID
    });
}

/**
 * Hook to fetch grants for a specific institute
 */
export function useInstituteGrants(
    id: number | string,
    page = 1,
    pageSize = 20
) {
    return useQuery({
        queryKey: [...instituteKeys.grants(Number(id)), { page, pageSize }],
        queryFn: async () => {
            const response = await API.get<{
                message: string;
                data: any[];
                metadata: {
                    count: number;
                    totalCount: number;
                    page: number;
                    pageSize: number;
                    totalPages: number;
                };
            }>(`/institutes/${id}/grants`, {
                params: { page, pageSize },
            });
            return response.data;
        },
        enabled: !!id,
    });
}

/**
 * Hook to fetch recipients for a specific institute
 */
export function useInstituteRecipients(
    id: number | string,
    page = 1,
    pageSize = 20
) {
    return useQuery({
        queryKey: [...instituteKeys.recipients(Number(id)), { page, pageSize }],
        queryFn: async () => {
            const response = await API.get<{
                message: string;
                data: any[];
                metadata: {
                    count: number;
                    totalCount: number;
                    page: number;
                    pageSize: number;
                    totalPages: number;
                };
            }>(`/institutes/${id}/recipients`, {
                params: { page, pageSize },
            });
            return response.data;
        },
        enabled: !!id,
    });
}

/**
 * Hook to search institutes by name
 */
export function useSearchInstitutes(term: string, page = 1, pageSize = 20) {
    return useQuery({
        queryKey: [...instituteKeys.search(term), { page, pageSize }],
        queryFn: async () => {
            const response = await API.get<InstituteListResponse>(
                "/institutes/search",
                { params: { term, page, pageSize } }
            );
            return response.data;
        },
        enabled: term.length > 0,
    });
}
