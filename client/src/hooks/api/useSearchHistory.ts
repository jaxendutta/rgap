// src/hooks/api/useSearchHistory.ts
import {
    useMutation,
    useQueryClient,
    useInfiniteQuery,
    UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { SearchHistory } from "@/types/models";
import { GrantSearchParams } from "@/types/search";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import createAPI from "@/utils/api";

const API = createAPI();

export const searchHistoryKeys = {
    all: ["searchHistory"] as const,
    lists: () => [...searchHistoryKeys.all, "list"] as const,
    list: (filters: any) =>
        [...searchHistoryKeys.lists(), { filters }] as const,
    detail: (id: number) => [...searchHistoryKeys.all, "detail", id] as const,
};

/**
 * Adapts raw search history from DB to structured SearchHistory format
 */
export const adaptSearchHistory = (rawHistory: any[]): SearchHistory[] => {
    if (!rawHistory || !Array.isArray(rawHistory)) {
        return [];
    }

    return rawHistory.map((item) => {
        // Convert search filters from string to object if needed
        let searchFilters = item.search_filters;
        try {
            if (typeof searchFilters === "string") {
                searchFilters = JSON.parse(searchFilters);
            }
        } catch (e) {
            console.error("Error parsing search filters:", e);
            searchFilters = {};
        }

        // Build structured search params
        const searchParams: GrantSearchParams = {
            searchTerms: {
                recipient: item.search_recipient || "",
                grant: item.search_grant || "",
                institute: item.search_institution || "",
            },
            filters: searchFilters || DEFAULT_FILTER_STATE,
            sortConfig: { field: "agreement_start_date", direction: "desc" },
        };

        // Create structured SearchHistory object
        return {
            history_id: item.history_id,
            search_time: new Date(item.search_time),
            search_params: searchParams,
            result_count: item.result_count || 0,
            bookmarked: Boolean(item.bookmarked),
        };
    });
};

/**
 * Hook to fetch user search history with adaptation to structured format
 */
export function useUserSearchHistory(
    userId?: number | null,
    sortField = "search_time",
    sortDirection = "desc",
    limit = 20
): UseInfiniteQueryResult<SearchHistory[], Error> {
    return useInfiniteQuery({
        queryKey: searchHistoryKeys.list({ userId, sortField, sortDirection }),
        queryFn: async ({ pageParam = 1 }) => {
            if (!userId)
                return {
                    data: [],
                    metadata: {
                        totalCount: 0,
                        page: 1,
                        pageSize: limit,
                        totalPages: 0,
                    },
                };

            try {
                const response = await API.get(`/search-history/${userId}`, {
                    params: {
                        sortField,
                        sortDirection,
                        page: pageParam,
                        limit,
                    },
                });

                // Process the search history data
                const searchHistories = adaptSearchHistory(
                    response.data.searches || []
                );

                // Return the data in a format that matches what EntityList expects for infinite queries
                return {
                    data: searchHistories,
                    metadata: {
                        totalCount: response.data.totalCount || 0,
                        page: Number(pageParam),
                        pageSize: limit,
                        totalPages: Math.ceil(
                            (response.data.totalCount || 0) / limit
                        ),
                    },
                };
            } catch (error) {
                console.error("Error fetching search history:", error);
                throw error;
            }
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            // If we have more pages, return the next page number
            if (lastPage.metadata.page < lastPage.metadata.totalPages) {
                return lastPage.metadata.page + 1;
            }
            return undefined;
        },
        enabled: !!userId,
    });
}

/**
 * Hook to delete a search history entry
 */
export function useDeleteSearchHistory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (historyId: number) => {
            const response = await API.delete(`/search-history/${historyId}`);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate search history queries when an entry is deleted
            queryClient.invalidateQueries({
                queryKey: searchHistoryKeys.lists(),
            });
        },
    });
}
