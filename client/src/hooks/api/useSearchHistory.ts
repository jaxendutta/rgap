// Update to src/hooks/api/useSearchHistory.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SearchHistory } from "@/types/models";
import { GrantSearchParams } from "@/types/search";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import portConfig from "../../../../config/ports.json";

export const searchHistoryKeys = {
    all: ["searchHistory"] as const,
    lists: () => [...searchHistoryKeys.all, "list"] as const,
    list: (filters: any) =>
        [...searchHistoryKeys.lists(), { filters }] as const,
    detail: (id: number) => [...searchHistoryKeys.all, "detail", id] as const,
};

/**
 * Adapts raw search history from DB to structured GrantSearchParams format
 */
export const adaptSearchHistory = (rawHistory: any[]): SearchHistory[] => {
    if (!rawHistory || !Array.isArray(rawHistory)) {
        return [];
    }

    return rawHistory.map((item) => {
        // Initialize with default values to ensure proper structure
        let searchTerms = { recipient: "", institute: "", grant: "" };
        let searchFilters = DEFAULT_FILTER_STATE;

        // Process search terms
        try {
            // If search terms were stored as strings in the DB
            if (
                item.search_recipient ||
                item.search_grant ||
                item.search_institution
            ) {
                searchTerms = {
                    recipient: item.search_recipient || "",
                    grant: item.search_grant || "",
                    institute: item.search_institution || "",
                };
            }
        } catch (e) {
            console.error("Error parsing search terms:", e);
        }

        // Process search filters
        try {
            if (typeof item.search_filters === "string") {
                searchFilters = JSON.parse(item.search_filters);
            } else if (
                item.search_filters &&
                typeof item.search_filters === "object"
            ) {
                searchFilters = item.search_filters;
            }

            // Validate filter structure
            if (!searchFilters.agencies) searchFilters.agencies = [];
            if (!searchFilters.countries) searchFilters.countries = [];
            if (!searchFilters.provinces) searchFilters.provinces = [];
            if (!searchFilters.cities) searchFilters.cities = [];

            if (!searchFilters.dateRange) {
                searchFilters.dateRange = DEFAULT_FILTER_STATE.dateRange;
            } else {
                // Ensure dates are Date objects
                if (
                    searchFilters.dateRange.from &&
                    typeof searchFilters.dateRange.from === "string"
                ) {
                    searchFilters.dateRange.from = new Date(
                        searchFilters.dateRange.from
                    );
                }
                if (
                    searchFilters.dateRange.to &&
                    typeof searchFilters.dateRange.to === "string"
                ) {
                    searchFilters.dateRange.to = new Date(
                        searchFilters.dateRange.to
                    );
                }
            }

            if (!searchFilters.valueRange) {
                searchFilters.valueRange = DEFAULT_FILTER_STATE.valueRange;
            }
        } catch (e) {
            console.error("Error parsing search filters:", e);
            searchFilters = DEFAULT_FILTER_STATE;
        }

        // Build structured search params
        const searchParams: GrantSearchParams = {
            searchTerms: searchTerms,
            filters: searchFilters,
            sortConfig: { field: "date", direction: "desc" },
        };

        // Create structured SearchHistory object
        return {
            history_id: item.history_id,
            search_time: new Date(item.search_time),
            search_params: searchParams,
            result_count: item.result_count || 0,
            bookmarked: !!item.bookmarked,
            ...item,
        };
    });
};

/**
 * Hook to fetch user search history with adaptation to structured format
 */
export function useUserSearchHistory(
    userId?: number | null,
    sortField = "search_time",
    sortDirection = "desc"
) {
    return useQuery({
        queryKey: searchHistoryKeys.list({ userId, sortField, sortDirection }),
        queryFn: async () => {
            if (!userId) return { searches: [] };

            const baseurl =
                process.env.VITE_API_URL ||
                `http://localhost:${portConfig.defaults.server}`;
            const response = await fetch(
                `${baseurl}/search-history/${userId}?sortField=${sortField}&sortDirection=${sortDirection}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch search history");
            }

            const data = await response.json();

            // Adapt raw search history to structured format
            return {
                searches: adaptSearchHistory(data.searches || []),
            };
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
            const baseurl =
                process.env.VITE_API_URL ||
                `http://localhost:${portConfig.defaults.server}`;
            const response = await fetch(
                `${baseurl}/search-history/${historyId}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete search history entry");
            }

            return await response.json();
        },
        onSuccess: () => {
            // Invalidate search history queries when an entry is deleted
            queryClient.invalidateQueries({
                queryKey: searchHistoryKeys.lists(),
            });
        },
    });
}
