// src/hooks/api/useSearchHistory.ts
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
            sortConfig: { field: "date", direction: "desc" },
        };

        // Create structured SearchHistory object
        return {
            history_id: item.history_id,
            search_time: new Date(item.search_time),
            search_params: searchParams,
            result_count: item.result_count || 0,
            // Include original fields for backward compatibility
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
