// src/hooks/api/useData.ts
import {
    useQuery,
    useInfiniteQuery,
    UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import createAPI from "@/utils/api";
import { GrantSearchParams } from "@/types/search";

const API = createAPI();

// Type for configuring the query type
export type QueryType = "regular" | "infinite";

// Type for the pagination parameters
export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

// Type for the sorting parameters
export interface SortParams {
    field?: string;
    direction?: "asc" | "desc";
}

// Type for the general data fetch options
export interface DataFetchOptions {
    queryType?: QueryType;
    pagination?: PaginationParams;
    sort?: SortParams;
    userId?: number | null;
    enabled?: boolean;
    keepPreviousData?: boolean;
    queryOptions?: any; // Additional query options
}

// Helper functions for working with query results
export function getDataFromResult(result: any): any[] {
    if (!result || !result.data) return [];

    // Handle regular query
    if ("data" in result.data) {
        return result.data.data || [];
    }

    // Handle infinite query
    if ("pages" in result.data) {
        return result.data.pages.flatMap((page: any) => page.data || []);
    }

    return [];
}

export function getTotalFromResult(result: any): number {
    if (!result || !result.data) return 0;

    // Handle regular query
    if ("metadata" in result.data) {
        return result.data.metadata.totalCount || 0;
    }

    // Handle infinite query
    if ("pages" in result.data && result.data.pages.length > 0) {
        return result.data.pages[0].metadata?.totalCount || 0;
    }

    return 0;
}

/**
 * Universal hook for fetching data with bookmarking support
 */
export function useData(
    endpoint: string,
    params: Record<string, any> = {},
    options: DataFetchOptions = {}
) {
    const {
        queryType = "regular",
        pagination = { page: 1, pageSize: 20 },
        sort = { field: "date", direction: "desc" },
        userId: explicitUserId,
        enabled = true,
        keepPreviousData = false,
        queryOptions = {},
    } = options;

    // Get current user from auth context
    const { user } = useAuth();

    // Use explicit user ID if provided, otherwise use current user's ID
    const userId =
        explicitUserId !== undefined ? explicitUserId : user?.user_id;

    // Construct query parameters
    const queryParams = {
        ...params,
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortField: sort.field,
        sortDirection: sort.direction,
        user_id: userId,
    };

    // Construct query key based on endpoint, params, and options
    const queryKey = [endpoint, queryParams, { type: queryType }];

    // For infinite queries
    if (queryType === "infinite") {
        return useInfiniteQuery({
            queryKey,
            queryFn: async ({ pageParam = 1 }) => {
                const response = await API.get(endpoint, {
                    params: {
                        ...queryParams,
                        page: pageParam,
                    },
                });
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
            enabled,
            ...queryOptions,
        });
    }

    // For regular queries
    return useQuery({
        queryKey,
        queryFn: async () => {
            const response = await API.get(endpoint, { params: queryParams });
            return response.data;
        },
        enabled,
        keepPreviousData,
        ...queryOptions,
    });
}

/**
 * Hook for searching with POST requests, with support for infinite queries
 */
export function useSearchData(
    endpoint: string,
    searchParams: any,
    options: DataFetchOptions = {}
) {
    const {
        queryType = "infinite",
        pagination = { page: 1, pageSize: 20 },
        userId: explicitUserId,
        enabled = true,
        queryOptions = {},
    } = options;

    // Get current user from auth context
    const { user } = useAuth();

    // Use explicit user ID if provided, otherwise use current user's ID
    const userId =
        explicitUserId !== undefined ? explicitUserId : user?.user_id;

    // Construct query key based on endpoint, search params, and options
    const queryKey = [endpoint, searchParams, { type: queryType, userId }];

    // For infinite queries
    if (queryType === "infinite") {
        return useInfiniteQuery({
            queryKey,
            queryFn: async ({ pageParam = 1 }) => {
                const payload = {
                    ...searchParams,
                    pagination: {
                        page: pageParam,
                        pageSize: pagination.pageSize,
                    },
                    userId,
                };

                const response = await API.post(endpoint, payload);
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
            enabled,
            ...queryOptions,
        });
    }

    // For regular queries
    return useQuery({
        queryKey,
        queryFn: async () => {
            const payload = {
                ...searchParams,
                pagination: {
                    page: pagination.page,
                    pageSize: pagination.pageSize,
                },
                userId,
            };

            const response = await API.post(endpoint, payload);
            return response.data;
        },
        enabled,
        ...queryOptions,
    });
}

/**
 * Hook for retrieving a specific entity by ID with bookmark information
 */
export function useEntityById(
    entityType: "recipient" | "institute" | "grant",
    id: number | string | undefined,
    options: Omit<DataFetchOptions, "queryType" | "pagination"> = {}
) {
    const {
        userId: explicitUserId,
        enabled: explicitEnabled,
        queryOptions = {},
    } = options;

    // Get current user from auth context
    const { user } = useAuth();

    // Use explicit user ID if provided, otherwise use current user's ID
    const userId =
        explicitUserId !== undefined ? explicitUserId : user?.user_id;

    // Only enable if we have a valid ID
    const enabled =
        explicitEnabled !== false &&
        id !== undefined &&
        id !== null &&
        id !== "";

    // Construct the endpoint
    const endpoint = `/${entityType}s/${id}`;

    return useQuery({
        queryKey: [endpoint, { userId }],
        queryFn: async () => {
            const response = await API.get(endpoint, {
                params: { user_id: userId },
            });
            return response.data;
        },
        enabled,
        ...queryOptions,
    });
}

/**
 * Hook for getting entity grants with bookmark information
 */
export function useEntityGrants(
    entityType: "recipient" | "institute",
    id: number | string | undefined,
    options: DataFetchOptions = {}
): UseInfiniteQueryResult<any, Error> {
    const {
        pagination = { page: 1, pageSize: 20 },
        sort = { field: "date", direction: "desc" },
        userId: explicitUserId,
        enabled: explicitEnabled,
        queryOptions = {},
    } = options;

    // Only enable if we have a valid ID
    const enabled =
        explicitEnabled !== false &&
        id !== undefined &&
        id !== null &&
        id !== "";

    // Construct the endpoint
    const endpoint = `/${entityType}s/${id}/grants`;

    // Force return type to be UseInfiniteQueryResult for GrantsList component
    return useInfiniteQuery({
        queryKey: [endpoint, sort, { userId: explicitUserId }],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await API.get(endpoint, {
                params: {
                    page: pageParam,
                    pageSize: pagination.pageSize,
                    sortField: sort.field,
                    sortDirection: sort.direction,
                    user_id: explicitUserId,
                },
            });

            // Process the grants data to ensure amendments_history is properly parsed
            const processedData = {
                ...response.data,
                data: response.data.data.map((grant: any) => ({
                    ...grant,
                    amendments_history:
                        typeof grant.amendments_history === "string"
                            ? JSON.parse(grant.amendments_history)
                            : grant.amendments_history,
                })),
            };

            return processedData;
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
        enabled,
        ...queryOptions,
    });
}

// Specific hooks for common use cases

/**
 * Hook for retrieving recipients with bookmarking information
 */
export function useRecipients(options: DataFetchOptions = {}) {
    return useData("/recipients", {}, options);
}

/**
 * Hook for retrieving institutes with bookmarking information
 */
export function useInstitutes(options: DataFetchOptions = {}) {
    return useData("/institutes", {}, options);
}

/**
 * Hook for retrieving a specific recipient with bookmarking information
 */
export function useRecipientDetails(
    id: number | string | undefined,
    options: Omit<DataFetchOptions, "queryType" | "pagination"> = {}
) {
    return useEntityById("recipient", id, options);
}

/**
 * Hook for retrieving a specific institute with bookmarking information
 */
export function useInstituteDetails(
    id: number | string | undefined,
    options: Omit<DataFetchOptions, "queryType" | "pagination"> = {}
) {
    return useEntityById("institute", id, options);
}

/**
 * Hook for retrieving grants for a specific recipient with bookmarking information
 */
export function useRecipientGrants(
    id: number | string | undefined,
    options: DataFetchOptions = {}
) {
    return useEntityGrants("recipient", id, options);
}

/**
 * Hook for retrieving grants for a specific institute with bookmarking information
 */
export function useInstituteGrants(
    id: number | string | undefined,
    options: DataFetchOptions = {}
) {
    return useEntityGrants("institute", id, options);
}

/**
 * Hook for retrieving recipients for a specific institute with bookmarking information
 * This implementation directly calls the institute recipients endpoint
 */
export function useInstituteRecipients(
    id: number | string | undefined,
    options: DataFetchOptions = {}
) {
    const {
        pagination = { page: 1, pageSize: 20 },
        sort = { field: "total_funding", direction: "desc" },
        userId: explicitUserId,
        enabled: explicitEnabled,
        queryOptions = {},
    } = options;

    // Get current user from auth context
    const { user } = useAuth();

    // Use explicit user ID if provided, otherwise use current user's ID
    const userId =
        explicitUserId !== undefined ? explicitUserId : user?.user_id;

    // Only enable if we have a valid ID
    const enabled =
        explicitEnabled !== false &&
        id !== undefined &&
        id !== null &&
        id !== "";

    // Construct the endpoint
    const endpoint = `/institutes/${id}/recipients`;

    return useInfiniteQuery({
        queryKey: [endpoint, sort, { userId }],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await API.get(endpoint, {
                params: {
                    page: pageParam,
                    pageSize: pagination.pageSize,
                    sortField: sort.field,
                    sortDirection: sort.direction,
                    user_id: userId,
                },
            });
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
        enabled,
        ...queryOptions,
    });
}

/**
 * Hook for searching recipients with bookmarking information
 */
export function useSearchRecipients(
    term: string,
    options: DataFetchOptions = {}
) {
    const { enabled: explicitEnabled, ...restOptions } = options;

    // Only enable if we have a search term
    const enabled =
        explicitEnabled !== false && !!term && term.trim().length > 0;

    return useData(
        "/recipients/search",
        { term },
        {
            ...restOptions,
            enabled,
        }
    );
}

/**
 * Hook for searching institutes with bookmarking information
 */
export function useSearchInstitutes(
    term: string,
    options: DataFetchOptions = {}
) {
    const { enabled: explicitEnabled, ...restOptions } = options;

    // Only enable if we have a search term
    const enabled =
        explicitEnabled !== false && !!term && term.trim().length > 0;

    return useData(
        "/institutes/search",
        { term },
        {
            ...restOptions,
            enabled,
        }
    );
}

/**
 * Hook for advanced grant search with bookmarking information
 */
export function useGrantSearch(
    searchParams: GrantSearchParams,
    options: DataFetchOptions = {}
) {
    return useSearchData("/search", searchParams, options);
}
