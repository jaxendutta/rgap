// src/hooks/api/usePopularSearches.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import createAPI from "@/utils/api";
import { formatDateOnly } from "@/utils/format";
import { PopularSearch, SearchCategory } from "@/types/search";

const API = createAPI();

export interface PopularSearchesParams {
    dateRange: {
        from: Date;
        to: Date;
    };
    category?: SearchCategory;
    limit?: number;
    enabled?: boolean;
}

export const popularSearchesQueryKey = {
    all: () => ["popularSearches"] as const,
    lists: () => [...popularSearchesQueryKey.all(), "list"] as const,
    infinite: (params: PopularSearchesParams) =>
        [
            ...popularSearchesQueryKey.lists(),
            {
                from: formatDateOnly(params.dateRange.from),
                to: formatDateOnly(params.dateRange.to),
                category: params.category,
                limit: params.limit,
            },
            "infinite",
        ] as const,
};

/**
 * Hook to fetch popular search terms with infinite pagination
 */
export function usePopularSearches({
    dateRange,
    category,
    limit = 10,
    enabled = true,
}: PopularSearchesParams) {
    // Format dates for API as YYYY-MM-DD
    const fromDate = formatDateOnly(dateRange.from);
    const toDate = formatDateOnly(dateRange.to);

    return useInfiniteQuery({
        queryKey: popularSearchesQueryKey.infinite({
            dateRange,
            category,
            limit,
        }),
        queryFn: async ({ pageParam = 1 }) => {
            try {
                const params: Record<string, any> = {
                    from: fromDate,
                    to: toDate,
                    limit,
                    page: pageParam,
                };

                // Add category if provided
                if (category) {
                    params.category = category;
                }

                const response = await API.get("/search/popular", {
                    params,
                });

                return {
                    data: processPopularSearchesData(response.data, category),
                    metadata: response.data.metadata || {
                        totalCount: 0,
                        totalPages: 1,
                        page: pageParam,
                        pageSize: limit,
                    },
                };
            } catch (error) {
                console.error("Error fetching popular searches:", error);
                throw error;
            }
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage.metadata;

            // If current page is less than total pages, return next page number
            if (page < totalPages) {
                return page + 1;
            }
            // Otherwise, return undefined to signal end of pagination
            return undefined;
        },
        enabled,
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    });
}

/**
 * Process API response to match our model structure
 */
function processPopularSearchesData(
    apiResponse: any,
    specificCategory?: SearchCategory
): PopularSearch[] {
    if (!apiResponse || (!apiResponse.results && !apiResponse.data)) {
        return [];
    }

    // Handle different response formats
    const resultsObject = apiResponse.results || apiResponse.data || {};

    // If a specific category is requested and exists in the response
    if (specificCategory && resultsObject[specificCategory]) {
        return resultsObject[specificCategory].map(
            (item: any, index: number) => ({
                ...item,
                category: specificCategory,
                index,
            })
        );
    }

    // Otherwise combine all categories
    const allSearches: PopularSearch[] = [];

    // Process each category in the response
    Object.entries(resultsObject).forEach(
        ([category, searches]: [string, any]) => {
            if (Array.isArray(searches)) {
                searches.forEach((search: any, index: number) => {
                    allSearches.push({
                        ...search,
                        category: category as SearchCategory,
                        index,
                    });
                });
            }
        }
    );

    return allSearches;
}

export default usePopularSearches;
