// src/hooks/usePopularSearches.ts
import { useState, useEffect, useCallback } from "react";
import createAPI from "@/utils/api";
import { formatDateOnly } from "@/utils/format";

const API = createAPI();

export type SearchCategory = "recipient" | "institute" | "grant";

export interface PopularSearchTerm {
    text: string;
    count: number;
}

export type PopularSearches = Record<SearchCategory, PopularSearchTerm[]>;

interface DateRange {
    from: Date;
    to: Date;
}

interface UsePopularSearchesOptions {
    dateRange: DateRange;
    enabled?: boolean; // Flag to control if data fetching should happen automatically
}

interface UsePopularSearchesResult {
    popularSearches: PopularSearches;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    hasData: boolean; // Flag to indicate if data has been loaded at least once
}

/**
 * Custom hook to fetch popular search terms
 * @param options - Object containing dateRange and enabled flag
 * @returns Object with popularSearches data, loading state, error state, and refetch function
 */
export const usePopularSearches = (
    options: UsePopularSearchesOptions
): UsePopularSearchesResult => {
    const { dateRange, enabled = true } = options;

    const [popularSearches, setPopularSearches] = useState<PopularSearches>({
        recipient: [],
        institute: [],
        grant: [],
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hasData, setHasData] = useState<boolean>(false);

    // Define fetch function to allow manual refetching
    const fetchPopularSearches = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Format dates for API as YYYY-MM-DD
            const fromDate = formatDateOnly(dateRange.from);
            const toDate = formatDateOnly(dateRange.to);

            console.log(
                `Fetching popular searches from ${fromDate} to ${toDate}`
            );

            // Call API
            const response = await API.get("/popular-searches", {
                params: {
                    from: fromDate,
                    to: toDate,
                },
            });

            // Process response
            if (response.data) {
                console.log("Popular search response:", response.data);

                // Validate the response structure and provide defaults for missing categories
                const data = response.data;
                const validData: PopularSearches = {
                    recipient: Array.isArray(data.recipient)
                        ? data.recipient
                        : [],
                    institute: Array.isArray(data.institute)
                        ? data.institute
                        : [],
                    grant: Array.isArray(data.grant) ? data.grant : [],
                };

                setPopularSearches(validData);
                setHasData(true);
            }
        } catch (err: any) {
            console.error("Error fetching popular searches:", err);
            setError(err?.message || "Failed to load popular searches");

            // Mock data only in development for better debugging
            if (process.env.NODE_ENV === "development") {
                console.warn("Using mock data for development");
                setPopularSearches({
                    recipient: [
                        { text: "University of Toronto", count: 245 },
                        { text: "McGill University", count: 187 },
                        { text: "University of British Columbia", count: 156 },
                        { text: "University of Alberta", count: 129 },
                        { text: "Dalhousie University", count: 98 },
                    ],
                    institute: [
                        { text: "University of Toronto", count: 312 },
                        { text: "McGill University", count: 287 },
                        { text: "University of British Columbia", count: 254 },
                        { text: "University of Waterloo", count: 198 },
                        { text: "University of Alberta", count: 176 },
                    ],
                    grant: [
                        { text: "COVID-19 Research", count: 145 },
                        { text: "Cancer Research", count: 132 },
                        { text: "Climate Change", count: 118 },
                        { text: "Artificial Intelligence", count: 98 },
                        { text: "Renewable Energy", count: 87 },
                    ],
                });
                setHasData(true);
            }
        } finally {
            setIsLoading(false);
        }
    }, [dateRange.from, dateRange.to]);

    // Fetch data when date range changes or when enabled status changes
    useEffect(() => {
        if (enabled) {
            fetchPopularSearches();
        }
    }, [fetchPopularSearches, enabled]);

    return {
        popularSearches,
        isLoading,
        error,
        refetch: fetchPopularSearches,
        hasData,
    };
};

export default usePopularSearches;
