// src/hooks/api/useInstitutes.ts
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Grant, Institute } from "@/types/models";
import createAPI from "@/utils/api";

const API = createAPI(); // Use default 10000ms timeout

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

// Institute details response interface
interface InstituteDetailsResponse {
    message: string;
    data: Institute & {
        recipients: Array<{
            recipient_id: number;
            legal_name: string;
            grant_count: number;
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
            const response = await API.get<InstituteDetailsResponse>(
                `/institutes/${parsedId}`
            );
            return response.data;
        },
        enabled: isValidId, // Only run query when we have a valid ID
    });
}

/**
 * Hook to fetch intitutes by their IDs
 * @param ids Array of institute IDs
 * @returns Query object
 */
export function useInstitutesByIds(ids: number[]) {
    return useQuery({
        queryKey: [...instituteKeys.all, "byIds", ids],
        queryFn: async () => {
            if (!ids || ids.length === 0) {
                return { message: "No institute IDs provided", data: [] };
            }

            // Fetch each institute individually and combine results
            const results = await Promise.all(
                ids.map(async (id) => {
                    try {
                        const response = await API.get(`/institutes/${id}`);
                        return response.data?.data || null;
                    } catch (error) {
                        console.error(`Error fetching institute ${id}:`, error);
                        return null;
                    }
                })
            );

            return results.filter(Boolean); // Filter out any null results
        },
        enabled: ids.length > 0, // Only run when we have IDs
    });
}

/**
 * Hook to fetch grants for a specific institute with amendments
 */
export function useInstituteGrants(
    id: number | string,
    page = 1,
    pageSize = 20,
    sortField: "date" | "value" = "date",
    sortDirection: "asc" | "desc" = "desc"
) {
    return useQuery({
        queryKey: [
            ...instituteKeys.grants(Number(id)),
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
            }>(`/institutes/${id}/grants`, {
                params: { page, pageSize, sortField, sortDirection },
            });

            // Process the consolidated grants to ensure amendment_history is properly parsed
            return {
                ...response.data,
                data: response.data.data.map((grant) => ({
                    ...grant,
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
 * Hook for infinite loading of institute grants with sorting
 */
export function useInfiniteInstituteGrants(
    instituteId: string | number,
    pageSize = 10,
    sortField: "date" | "value" = "date",
    sortDirection: "asc" | "desc" = "desc"
) {
    return useInfiniteQuery({
        queryKey: [
            ...instituteKeys.grants(Number(instituteId)),
            { pageSize, sortField, sortDirection },
        ],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await API.get(
                `/institutes/${instituteId}/grants`,
                {
                    params: {
                        page: pageParam,
                        pageSize,
                        sortField,
                        sortDirection,
                    },
                }
            );

            // Ensure amendments_history is properly parsed
            if (response.data?.data) {
                response.data.data = response.data.data.map((grant: any) => ({
                    ...grant,
                    amendments_history:
                        typeof grant.amendments_history === "string"
                            ? JSON.parse(grant.amendments_history)
                            : grant.amendments_history,
                }));
            }

            return response.data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (
                lastPage.metadata &&
                lastPage.metadata.page < lastPage.metadata.totalPages
            ) {
                return lastPage.metadata.page + 1;
            }
            return undefined;
        },
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
 * Hook for infinite loading of institute recipients
 */
export function useInfiniteInstituteRecipients(
    instituteId: string | number,
    pageSize = 10,
    sortField: "total_funding" | "grant_count" = "total_funding",
    sortDirection: "asc" | "desc" = "desc"
) {
    return useInfiniteQuery({
        queryKey: [
            ...instituteKeys.recipients(Number(instituteId)),
            { pageSize, sortField, sortDirection },
        ],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await API.get(
                `/institutes/${instituteId}/recipients`,
                {
                    params: {
                        page: pageParam,
                        pageSize,
                        sortField,
                        sortDirection,
                    },
                }
            );
            return response.data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (
                lastPage.metadata &&
                lastPage.metadata.page < lastPage.metadata.totalPages
            ) {
                return lastPage.metadata.page + 1;
            }
            return undefined;
        },
    });
}

// Query key factory
export const instituteSearchKeys = {
    all: ["institutes", "search"] as const,
    search: (term: string) => [...instituteSearchKeys.all, term] as const,
};

interface InstituteSearchResponse {
    message: string;
    data: Institute[];
    metadata: {
        term: string;
        count: number;
        totalCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}

/**
 * Hook to search institutes by name, type, or location
 * @param term Search term
 * @param enabled Whether this query should run
 * @param page Page number (1-based)
 * @param pageSize Items per page
 */
export const useSearchInstitutes = (
    term: string,
    enabled = false,
    page = 1,
    pageSize = 20
) => {
    return useQuery({
        queryKey: [...instituteSearchKeys.search(term), { page, pageSize }],
        queryFn: async () => {
            if (!term || term.trim() === "") {
                return {
                    message: "No search term provided",
                    data: [],
                    metadata: {
                        term: "",
                        count: 0,
                        totalCount: 0,
                        page,
                        pageSize,
                        totalPages: 0,
                    },
                };
            }

            const response = await API.get<InstituteSearchResponse>(
                "/institutes/search",
                {
                    params: { term, page, pageSize },
                }
            );
            return response.data;
        },
        enabled: enabled && term.length > 0,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export default useSearchInstitutes;
