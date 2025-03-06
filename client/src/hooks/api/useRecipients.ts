// src/hooks/api/useRecipients.ts
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import portConfig from "../../../../config/ports.json";
import { Recipient, Grant } from "@/types/models";

const API = axios.create({
    baseURL:
        process.env.VITE_API_URL ||
        `http://localhost:${portConfig.defaults.server}`,
    timeout: 10000,
});

// Query key factory
export const recipientKeys = {
    all: ["recipients"] as const,
    lists: () => [...recipientKeys.all, "list"] as const,
    list: (filters: any) => [...recipientKeys.lists(), { filters }] as const,
    details: () => [...recipientKeys.all, "detail"] as const,
    detail: (id: number) => [...recipientKeys.details(), id] as const,
    grants: (id: number) => [...recipientKeys.detail(id), "grants"] as const,
    search: (term: string) => [...recipientKeys.all, "search", term] as const,
};

// Interface for recipient details response
interface RecipientDetailsResponse {
    message: string;
    data: {
        recipient_id: number;
        legal_name: string;
        institute_id: number;
        research_organization_name: string; // This contains the institute name
        institute_type?: string;
        type?: string;
        recipient_type?: string;
        total_grants: number;
        total_funding: number;
        avg_funding: number;
        first_grant_date?: string;
        latest_grant_date?: string;
        funding_agencies_count?: number;
        city?: string;
        province?: string;
        country?: string;
        grants: Array<
            Grant & {
                program_name?: string;
            }
        >;
        funding_history: Array<{
            year: number;
            [agency: string]: number;
        }>;
    };
}

// Interface for recipient list response
interface RecipientListResponse {
    message: string;
    data: Recipient[];
    metadata: {
        count: number;
        totalCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}

/**
 * Hook to fetch a paginated list of recipients
 */
export function useRecipients(page = 1, pageSize = 20) {
    return useQuery({
        queryKey: recipientKeys.list({ page, pageSize }),
        queryFn: async () => {
            const response = await API.get<RecipientListResponse>(
                "/recipients",
                { params: { page, pageSize } }
            );
            return response.data;
        },
    });
}

/**
 * Hook to fetch infinite paginated list of recipients
 */
export function useInfiniteRecipients(pageSize = 20) {
    return useInfiniteQuery({
        queryKey: recipientKeys.lists(),
        queryFn: async ({ pageParam = 1 }) => {
            const response = await API.get<RecipientListResponse>(
                "/recipients",
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
 * Hook to fetch detailed information about a specific recipient
 */
export function useRecipientDetails(id: number | string) {
    return useQuery({
        queryKey: recipientKeys.detail(Number(id)),
        queryFn: async () => {
            const response = await API.get<RecipientDetailsResponse>(
                `/recipients/${id}`
            );
            return response.data;
        },
        enabled: !!id,
    });
}

/**
 * Hook to fetch grants for a specific recipient
 */
export function useRecipientGrants(
    id: number | string,
    page = 1,
    pageSize = 20,
    sortField: "date" | "value" = "date",
    sortDirection: "asc" | "desc" = "desc"
) {
    return useQuery({
        queryKey: [
            ...recipientKeys.grants(Number(id)),
            { page, pageSize, sortField, sortDirection },
        ],
        queryFn: async () => {
            const response = await API.get<{
                message: string;
                data: Grant[];
                metadata: {
                    count: number;
                    totalCount: number;
                    page: number;
                    pageSize: number;
                    totalPages: number;
                };
            }>(`/recipients/${id}/grants`, {
                params: { page, pageSize, sortField, sortDirection },
            });

            // Process the consolidated grants to match expected format
            return {
                ...response.data,
                data: response.data.data.map((grant) => ({
                    ...grant,
                    // Ensure amendment_history is properly parsed if needed
                    amendments_history:
                        typeof grant.amendments_history === "string"
                            ? JSON.parse(grant.amendments_history)
                            : grant.amendments_history,
                })),
            };
        },
        enabled: !!id,
    });
}

/**
 * Hook to search recipients by name or organization
 */
export function useSearchRecipients(term: string, page = 1, pageSize = 20) {
    return useQuery({
        queryKey: [...recipientKeys.search(term), { page, pageSize }],
        queryFn: async () => {
            const response = await API.get<RecipientListResponse>(
                "/recipients/search",
                { params: { term, page, pageSize } }
            );
            return response.data;
        },
        enabled: term.length > 0,
    });
}
