// src/components/features/grants/SearchResults.tsx
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ResearchGrant } from "@/types/models";
import { GrantCard } from "./GrantCard";
import { FileSearch, FileWarning, MoreHorizontal } from "lucide-react";
import { TrendVisualizer } from "@/components/features/visualizations/TrendVisualizer";
import { LoadingSpinner } from "@/components/common/ui/LoadingSpinner";
import { Button } from "@/components/common/ui/Button";
import { SearchResponse } from "@/types/search";
import { UseInfiniteQueryResult, InfiniteData } from "@tanstack/react-query";

type GroupByOption = "org" | "province" | "country" | "city";

interface SearchResultsProps {
    infiniteQuery: UseInfiniteQueryResult<InfiniteData<SearchResponse>, Error>;
    onBookmark?: (grantId: string) => void;
    showVisualization?: boolean;
    isInitialState?: boolean;
}

const groupByOptions = [
    { value: "org", label: "Funding Agency" },
    { value: "province", label: "Province/State" },
    { value: "country", label: "Country" },
    { value: "city", label: "City" },
];

export const SearchResults = ({
    infiniteQuery,
    onBookmark,
    showVisualization,
    isInitialState = true,
}: SearchResultsProps) => {
    const [groupBy, setGroupBy] = useState<GroupByOption>("org");
    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: "0px 0px 500px 0px", // Load more when user is 500px from the bottom
    });

    // Destructure the infiniteQuery
    const {
        data,
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        isError,
        error,
    } = infiniteQuery;

    // Flatten the pages of data into a single array
    const allGrants: ResearchGrant[] = data
        ? data.pages.flatMap((page) => page.data)
        : [];

    // Get total count from the first page if available
    const totalCount = data?.pages[0]?.metadata.totalCount || 0;

    // Load next page when user scrolls to the bottom
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage && !isInitialState) {
            fetchNextPage();
        }
    }, [
        inView,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        isInitialState,
    ]);

    const transformDataForVisualization = (data: ResearchGrant[]) => {
        const yearMap = new Map<
            number,
            { year: number; [key: string]: number }
        >();
        const uniqueCategories = new Set<string>();

        // First pass: collect all unique categories
        data.forEach((result) => {
            const categoryValue = result[groupBy as keyof ResearchGrant];
            if (categoryValue && typeof categoryValue === "string") {
                uniqueCategories.add(categoryValue);
            }
        });

        // Second pass: aggregate data
        data.forEach((result) => {
            const year = new Date(result.agreement_start_date).getFullYear();
            const value = parseFloat(result.agreement_value.toString()) || 0;
            const categoryValue = result[groupBy as keyof ResearchGrant];
            const category =
                categoryValue && typeof categoryValue === "string"
                    ? categoryValue
                    : "Unknown";

            if (!yearMap.has(year)) {
                const initialEntry: Record<string, any> = { year };

                uniqueCategories.forEach((cat) => {
                    initialEntry[cat] = 0;
                });

                yearMap.set(
                    year,
                    initialEntry as { year: number; [key: string]: number }
                );
            }

            const yearData = yearMap.get(year);
            if (yearData && category) {
                yearData[category] = (yearData[category] || 0) + value;
            }
        });

        return Array.from(yearMap.values())
            .sort((a, b) => a.year - b.year)
            .map((entry) => {
                const roundedEntry: { year: number; [key: string]: number } = {
                    year: entry.year,
                };

                Object.entries(entry).forEach(([key, value]) => {
                    if (key !== "year") {
                        roundedEntry[key] = Number(value.toFixed(2)) || 0;
                    }
                });

                return roundedEntry;
            });
    };

    if (isInitialState) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <FileSearch className="h-16 w-16 mb-4" />
                <h3 className="text-xl font-medium mb-2">Ready to Explore?</h3>
                <p className="text-center max-w-md">
                    Type a query above or use filters to begin your exploration.
                </p>
            </div>
        );
    }

    if (isLoading && !data) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <LoadingSpinner size="lg" className="mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Searching Grants...
                </h3>
                <p className="text-gray-500">This might take a moment</p>
            </div>
        );
    }

    if (isError && error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-red-500">
                <FileWarning className="h-16 w-16 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                    Oops! Something went wrong
                </h3>
                <p className="text-center">{error.message}</p>
                <p className="text-sm mt-2">
                    Please try again or contact support if the problem persists.
                </p>
            </div>
        );
    }

    if (!allGrants.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <FileWarning className="h-16 w-16 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Results Found</h3>
                <p className="text-center max-w-md">
                    Try adjusting your search terms or filters to find what
                    you're looking for.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Results count */}
            <div className="text-sm text-gray-500 p-2">
                Showing {allGrants.length} of {totalCount} results
            </div>

            {showVisualization && (
                <TrendVisualizer
                    data={transformDataForVisualization(allGrants)}
                    groupBy={groupBy}
                    onGroupByChange={(value) =>
                        setGroupBy(value as GroupByOption)
                    }
                    groupByOptions={groupByOptions}
                />
            )}

            {/* Grant cards */}
            <div className="space-y-4">
                {allGrants.map((grant, index) => (
                    <GrantCard
                        // Create a guaranteed unique key using a combination of values and the index
                        key={`grant-${grant.ref_number}-${
                            grant.amendment_number || "0"
                        }-page${Math.floor(index / 10)}-item${index}`}
                        grant={grant}
                        onBookmark={
                            onBookmark
                                ? () => onBookmark(grant.ref_number)
                                : undefined
                        }
                    />
                ))}
            </div>

            {/* Loading indicator at the bottom */}
            <div
                ref={ref}
                className="flex justify-center items-center py-4 h-20"
            >
                {isFetchingNextPage ? (
                    <div className="flex flex-col items-center">
                        <LoadingSpinner size="md" className="mb-2" />
                        <p className="text-sm text-gray-600">
                            Loading more results...
                        </p>
                    </div>
                ) : hasNextPage ? (
                    <Button
                        variant="outline"
                        icon={MoreHorizontal}
                        onClick={() => fetchNextPage()}
                    >
                        Load More Results
                    </Button>
                ) : allGrants.length > 0 ? (
                    <p className="text-sm text-gray-500">
                        No more results to load
                    </p>
                ) : null}
            </div>
        </div>
    );
};
