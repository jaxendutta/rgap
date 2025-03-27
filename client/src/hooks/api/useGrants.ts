// src/hooks/api/useGrants.ts
import {
    useInfiniteQuery,
    useQuery,
    InfiniteData,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { Grant } from "@/types/models";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import { GrantSearchParams, SearchResponse } from "@/types/search";
import createAPI from "@/utils/api";

const API = createAPI(15000); // Use 15000ms timeout

// Configure retry logic for specific error codes
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        // If we get a 409 Conflict from the server (temporary table issue)
        if (error.response?.status === 409 && error.response?.data?.retryable) {
            console.log(
                "Received retryable error, attempting to retry the request..."
            );

            // Wait a short delay before retrying
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Retry the request
            return API(error.config);
        }

        // For all other errors, just reject the promise
        return Promise.reject(error);
    }
);

export const grantKeys = {
    all: ["grants"] as const,
    search: (params: Omit<GrantSearchParams, "pagination">) =>
        [...grantKeys.all, "search", params] as const,
    infiniteSearch: (params: Omit<GrantSearchParams, "pagination">) =>
        [...grantKeys.all, "infiniteSearch", params] as const,
};

// Helper to create a clean copy of filters
const cleanFilters = (
    filters: typeof DEFAULT_FILTER_STATE = DEFAULT_FILTER_STATE
) => {
    // Ensure we have a filters object
    if (!filters) {
        return DEFAULT_FILTER_STATE;
    }

    // Handle array filters by ensuring they are arrays and contain only strings
    const cleanArrayFilter = (arr: any[] = []): string[] => {
        if (!Array.isArray(arr)) return [];
        return arr
            .filter((item) => item !== null && item !== undefined)
            .map((item) => String(item));
    };

    // Ensure the structure has all required properties with sensible defaults
    return {
        dateRange: {
            from:
                filters.dateRange?.from ?? DEFAULT_FILTER_STATE.dateRange.from,
            to: filters.dateRange?.to ?? DEFAULT_FILTER_STATE.dateRange.to,
        },
        valueRange: {
            min: filters.valueRange?.min ?? DEFAULT_FILTER_STATE.valueRange.min,
            max: filters.valueRange?.max ?? DEFAULT_FILTER_STATE.valueRange.max,
        },
        agencies: cleanArrayFilter(filters.agencies || []),
        countries: cleanArrayFilter(filters.countries || []),
        provinces: cleanArrayFilter(filters.provinces || []),
        cities: cleanArrayFilter(filters.cities || []),
    };
};

export function useGrantSearch(params: GrantSearchParams) {
    return useQuery({
        queryKey: grantKeys.search(params),
        queryFn: async () => {
            try {
                // Create a clean copy of the params to ensure we're using the most current values
                const cleanParams = {
                    ...params,
                    filters: cleanFilters(params.filters),
                };

                console.log("Sending search request with params:", cleanParams);

                const response = await API.post<SearchResponse>(
                    "/search",
                    cleanParams
                );

                if (!response.data?.data) {
                    console.warn("No data received from server");
                    return [];
                }

                return response.data.data;
            } catch (error) {
                console.error("Search request failed:", error);
                if (axios.isAxiosError(error)) {
                    throw new Error(
                        error.response?.data?.error || "Failed to search grants"
                    );
                }
                throw error;
            }
        },
        enabled: false, // IMPORTANT: Set to false to prevent auto-fetching
        staleTime: 30000, // Data considered fresh for 30 seconds
        gcTime: 5 * 60 * 1000, // Keep in garbage collection for 5 minutes
        retry: 1, // Only retry once on failure
        retryDelay: 1000, // Wait 1 second before retrying,
        refetchOnWindowFocus: false, // Prevent refetching when window regains focus
    });
}

export function useInfiniteGrantSearch(
    params: Omit<GrantSearchParams, "pagination"> | any = {},
    enabled: boolean = true
) {
    // Get the user context
    const { user } = useAuth();

    // Ensure params has the expected shape
    const ensureValidParams = (
        params: any
    ): Omit<GrantSearchParams, "pagination"> => {
        // If params is empty or not properly structured, create a default structure
        if (!params || typeof params !== "object") {
            return {
                searchTerms: { recipient: "", institute: "", grant: "" },
                filters: DEFAULT_FILTER_STATE,
                sortConfig: { field: "date", direction: "desc" },
            };
        }

        // Make sure searchTerms exists and has the right structure
        const searchTerms = params.searchTerms || {};
        const validSearchTerms = {
            recipient: searchTerms.recipient || "",
            institute: searchTerms.institute || "",
            grant: searchTerms.grant || "",
        };

        // Make sure filters exist
        const filters = params.filters || DEFAULT_FILTER_STATE;

        // Make sure sortConfig exists
        const sortConfig = params.sortConfig || {
            field: "date",
            direction: "desc",
        };

        return {
            searchTerms: validSearchTerms,
            filters,
            sortConfig,
        };
    };

    // Ensure we have valid params before proceeding
    const validParams = ensureValidParams(params);

    return useInfiniteQuery<
        SearchResponse,
        Error,
        InfiniteData<SearchResponse>
    >({
        queryKey: grantKeys.infiniteSearch(validParams),
        queryFn: async ({ pageParam }) => {
            try {
                // Create a clean copy of the params
                const cleanParams = {
                    ...validParams,
                    filters: cleanFilters(validParams.filters),
                    pagination: {
                        page: pageParam as number,
                        pageSize: 10, // Load 10 items per page
                    },
                    userId: user?.user_id || null, // Add the user ID if available
                };

                console.log("Sending infinite search request:", {
                    ...cleanParams,
                    pagination: cleanParams.pagination,
                });

                const response = await API.post<SearchResponse>(
                    "/search",
                    cleanParams
                );

                return response.data;
            } catch (error) {
                console.error("Infinite search request failed:", error);
                if (axios.isAxiosError(error)) {
                    throw new Error(
                        error.response?.data?.error || "Failed to search grants"
                    );
                }
                throw error;
            }
        },
        initialPageParam: 1, // This is required in React Query v5+
        getNextPageParam: (lastPage: SearchResponse) => {
            // If we've reached the last page, return undefined to signal that there are no more pages
            if (
                !lastPage.metadata ||
                lastPage.metadata.page >= lastPage.metadata.totalPages ||
                !lastPage.data ||
                lastPage.data.length === 0
            ) {
                return undefined;
            }
            // Otherwise, return the next page number
            return lastPage.metadata.page + 1;
        },
        retry: 3, // Retry up to 3 times
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000), // Exponential backoff
        staleTime: 30000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: enabled,
    });
}

export function useAllGrants() {
    return useQuery({
        queryKey: grantKeys.all,
        queryFn: async () => {
            const response = await API.get<Grant[]>("/search/all");
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}
