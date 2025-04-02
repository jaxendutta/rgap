// src/hooks/api/useData.ts
import { useEffect, useState } from "react";
import {
    useQuery,
    useQueryClient,
    UseQueryResult,
    useInfiniteQuery,
    UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import createAPI from "@/utils/api";
import { GrantSearchParams } from "@/types/search";

const API = createAPI();

// Type for configuring the query type
export type QueryType = "infinite" | "complete";

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
    queryOptions?: any;
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
 * Hook to fetch all data from an infinite query
 * This recursively fetches all pages until there's no more data
 */
export function useCompleteData(
    endpoint: string,
    params: Record<string, any> = {},
    options: Omit<DataFetchOptions, "queryType"> = {}
): UseQueryResult<any, Error> {
    const [completeData, setCompleteData] = useState<any[]>([]);
    const [isLoadingComplete, setIsLoadingComplete] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const {
        pagination = { page: 1, pageSize: 100000 }, // Use larger page size for efficiency
        sort = { field: "date", direction: "desc" },
        userId: explicitUserId,
        enabled = true,
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

    // Create the infinite query
    const infiniteQuery = useInfiniteQuery({
        queryKey: [endpoint, queryParams, { type: "complete" }],
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

    // Effect to fetch all pages when the infinite query changes
    useEffect(() => {
        const fetchAllPages = async () => {
            if (!infiniteQuery.data) return;

            setIsLoadingComplete(true);

            // Get current data and total count
            const currentData = getDataFromResult(infiniteQuery);
            const total = getTotalFromResult(infiniteQuery);

            // Store total count for reference
            setTotalCount(total);

            // If we haven't fetched all pages yet, fetch the next page
            if (infiniteQuery.hasNextPage) {
                await infiniteQuery.fetchNextPage();
            } else {
                // All pages fetched, update complete data
                setCompleteData(currentData);
                setIsLoadingComplete(false);
            }
        };

        if (infiniteQuery.isSuccess && !infiniteQuery.isFetchingNextPage) {
            fetchAllPages();
        }
    }, [
        infiniteQuery.data,
        infiniteQuery.hasNextPage,
        infiniteQuery.isSuccess,
        infiniteQuery.isFetchingNextPage,
    ]);

    // Return a UseQueryResult compatible object
    return {
        data: {
            data: completeData,
            metadata: { totalCount },
        },
        isLoading: infiniteQuery.isLoading || isLoadingComplete,
        isError: infiniteQuery.isError,
        error: infiniteQuery.error,
        refetch: infiniteQuery.refetch,
        // Add required properties to be compatible with UseQueryResult
        isSuccess: infiniteQuery.isSuccess && !isLoadingComplete,
        isRefetching: infiniteQuery.isRefetching,
        isPending: infiniteQuery.isPending,
        isFetching: infiniteQuery.isFetching,
        status:
            infiniteQuery.isLoading || isLoadingComplete
                ? "pending"
                : infiniteQuery.isError
                ? "error"
                : "success",
        fetchStatus: infiniteQuery.fetchStatus,
    } as UseQueryResult<any, Error>;
}

/**
 * Enhanced universal hook for fetching data with bookmarking support
 * Supports "complete" queryType for fetching all data
 */
/**
 * Enhanced universal hook for fetching data with bookmarking support
 * Supports "complete" queryType for fetching all data
 */
export function useData(
    endpoint: string,
    params: Record<string, any> = {},
    options: DataFetchOptions = {}
): UseQueryResult<any, Error> | UseInfiniteQueryResult<any, Error> {
    const queryClient = useQueryClient();
    const {
        queryType = "infinite",
        pagination = { page: 1, pageSize: 20 },
        sort = { field: "date", direction: "desc" },
        userId: explicitUserId,
        enabled = true,
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
    const queryKey = [
        endpoint,
        { ...params, sortField: sort.field, sortDirection: sort.direction },
        { type: queryType, pagination, userId },
    ];

    // For complete data fetch (all pages)
    if (queryType === "complete") {
        const completeQuery = useCompleteData(endpoint, params, options);

        // Add updateSort function
        const updateSort = (newSortConfig: SortParams) => {
            // Refetch with new sort config
            const newOptions = {
                ...options,
                sort: newSortConfig,
            };
            return useCompleteData(endpoint, params, newOptions);
        };

        return {
            ...completeQuery,
            updateSort,
        } as UseQueryResult<any, Error> & {
            updateSort: (
                newSortConfig: SortParams
            ) => UseQueryResult<any, Error>;
        };
    } else {
        // For infinite queries
        const infiniteQuery = useInfiniteQuery({
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

        // Add updateSort function for infinite queries
        const updateSort = (newSortConfig: SortParams) => {
            // Create new query key with updated sort
            const newParams = {
                ...params,
                sortField: newSortConfig.field,
                sortDirection: newSortConfig.direction,
            };

            const newQueryKey = [endpoint, newParams, { type: queryType }];

            // Reset the query cache to force a refetch with the new sort
            queryClient.resetQueries({ queryKey: newQueryKey });

            // Update the options for future queries
            options.sort = newSortConfig;
        };

        return {
            ...infiniteQuery,
            updateSort,
        } as UseInfiniteQueryResult<any, Error> & {
            updateSort: (newSortConfig: SortParams) => void;
        };
    }
}

/**
 * Hook for searching with POST requests, with support for infinite queries and complete data fetch
 */
export function useSearchData(
    endpoint: string,
    searchParams: any,
    options: DataFetchOptions = {}
): UseQueryResult<any, Error> | UseInfiniteQueryResult<any, Error> {
    const {
        queryType = options.queryType,
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

    // For complete data fetch
    if (queryType === "complete") {
        const [completeData, setCompleteData] = useState<any[]>([]);
        const [isLoadingComplete, setIsLoadingComplete] = useState(true);
        const [totalCount, setTotalCount] = useState(0);

        // Create the infinite query for fetching all pages
        const infiniteQuery = useInfiniteQuery({
            queryKey: [endpoint, searchParams, { type: "infinite", userId }],
            queryFn: async ({ pageParam = 1 }) => {
                const payload = {
                    ...searchParams,
                    pagination: {
                        page: pageParam,
                        pageSize: 100000, // Use larger page size for efficiency
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

        // Effect to fetch all pages when the infinite query changes
        useEffect(() => {
            const fetchAllPages = async () => {
                if (!infiniteQuery.data) return;

                setIsLoadingComplete(true);

                // Get current data and total count
                const currentData = infiniteQuery.data.pages.flatMap(
                    (page: any) => page.data || []
                );
                const total =
                    infiniteQuery.data.pages[0]?.metadata?.totalCount || 0;

                // Store total count for reference
                setTotalCount(total);

                // If we haven't fetched all pages yet, fetch the next page
                if (infiniteQuery.hasNextPage) {
                    await infiniteQuery.fetchNextPage();
                } else {
                    // All pages fetched, update complete data
                    setCompleteData(currentData);
                    setIsLoadingComplete(false);
                }
            };

            if (infiniteQuery.isSuccess && !infiniteQuery.isFetchingNextPage) {
                fetchAllPages();
            }
        }, [
            infiniteQuery.data,
            infiniteQuery.hasNextPage,
            infiniteQuery.isSuccess,
            infiniteQuery.isFetchingNextPage,
        ]);

        return {
            data: {
                data: completeData,
                metadata: { totalCount },
            },
            isLoading: infiniteQuery.isLoading || isLoadingComplete,
            isError: infiniteQuery.isError,
            error: infiniteQuery.error,
            refetch: infiniteQuery.refetch,
            isSuccess: infiniteQuery.isSuccess && !isLoadingComplete,
            isRefetching: infiniteQuery.isRefetching,
            isPending: infiniteQuery.isPending,
            isFetching: infiniteQuery.isFetching,
            status:
                infiniteQuery.isLoading || isLoadingComplete
                    ? "pending"
                    : infiniteQuery.isError
                    ? "error"
                    : "success",
            fetchStatus: infiniteQuery.fetchStatus,
        } as UseQueryResult<any, Error>;
    } else {
        // For infinite queries
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
        }) as UseInfiniteQueryResult<any, Error>;
    }
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
 * Hook for getting all entity grants with bookmark information
 * This uses the "complete" query type to fetch all pages
 */
export function useAllEntityGrants(
    entityType: "recipient" | "institute",
    id: number,
    options: Omit<DataFetchOptions, "queryType"> = {}
) {
    const {
        sort = { field: "date", direction: "desc" },
        userId: explicitUserId,
        enabled: explicitEnabled,
        queryOptions = {},
    } = options;

    // Only enable if we have a valid ID
    const enabled =
        explicitEnabled !== false && id !== undefined && id !== null;

    // Construct the endpoint
    const endpoint = `/${entityType}s/${id}/grants`;

    // Use the complete data hook to fetch all grants
    const result = useCompleteData(
        endpoint,
        {},
        {
            sort,
            userId: explicitUserId,
            enabled,
            queryOptions,
        }
    );

    return result.data?.data;
}

/**
 * Hook for getting entity grants with bookmark information
 * This uses the infinite query type for pagination
 */
export function useEntityGrants(
    entityType: "recipient" | "institute",
    id: number | string | undefined,
    options: DataFetchOptions = {}
): UseInfiniteQueryResult<any, Error> {
    const {
        queryType = "infinite",
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

    // Force return type to be UseInfiniteQueryResult
    if (queryType === "complete") {
        return useCompleteData(
            endpoint,
            {},
            {
                sort,
                userId: explicitUserId,
                enabled,
                queryOptions,
            }
        ) as unknown as UseInfiniteQueryResult<any, Error>;
    }

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

/**
 * Hook for retrieving all recipients for a specific institute
 * This uses the "complete" query type to fetch all pages
 */
export function useAllInstituteRecipients(
    id: number,
    options: Omit<DataFetchOptions, "queryType"> = {}
) {
    const {
        sort = { field: "total_funding", direction: "desc" },
        userId: explicitUserId,
        enabled: explicitEnabled,
        queryOptions = {},
    } = options;

    // Only enable if we have a valid ID
    const enabled =
        explicitEnabled !== false && id !== undefined && id !== null;

    // Construct the endpoint
    const endpoint = `/institutes/${id}/recipients`;

    // Use the complete data hook to fetch all recipients
    const result = useCompleteData(
        endpoint,
        {},
        {
            sort,
            userId: explicitUserId,
            enabled,
            queryOptions,
        }
    );

    return result.data?.data;
}

/**
 * Hook for retrieving recipients for a specific institute with pagination
 */
export function useInstituteRecipients(
    id: number | string | undefined,
    options: DataFetchOptions = {}
) {
    const {
        queryType = "infinite",
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

    // Handle complete data fetch
    if (queryType === "complete") {
        return useCompleteData(
            endpoint,
            {},
            {
                sort,
                userId: explicitUserId,
                enabled,
                queryOptions,
            }
        );
    }

    // For infinite queries
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
    options: DataFetchOptions & { logSearchHistory?: boolean } = {}
): UseInfiniteQueryResult<any, Error> {
    return useSearchData(
        "/search",
        { ...searchParams, logSearchHistory: options.logSearchHistory },
        options
    ) as UseInfiniteQueryResult<any, Error>;
}

export function useAllGrantSearch(
    searchParams: GrantSearchParams,
    options: DataFetchOptions & { logSearchHistory?: boolean } = {}
): UseQueryResult<any, Error> {
    return useSearchData(
        "/search",
        { ...searchParams, logSearchHistory: options.logSearchHistory },
        {
            ...options,
            queryType: "complete",
        }
    );
}
