// src/components/features/grants/SearchResults.tsx
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ResearchGrant } from "@/types/models";
import { GrantCard } from "./GrantCard";
import { MoreHorizontal } from "lucide-react";
import { TrendVisualizer } from "@/components/features/visualizations/TrendVisualizer";
import { Button } from "@/components/common/ui/Button";
import { SearchResponse } from "@/types/search";
import { UseInfiniteQueryResult, InfiniteData } from "@tanstack/react-query";
import LoadingState from "@/components/common/ui/LoadingState";
import EmptyState from "@/components/common/ui/EmptyState";
import ErrorState from "@/components/common/ui/ErrorState";

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
            <EmptyState
                title="Ready to Explore?"
                message="Type a query above or use filters to begin your exploration."
                variant="card"
                size="lg"
            />
        );
    }

    if (isLoading && !data) {
        return (
            <LoadingState
                title="Searching Grants..."
                message="This might take a moment"
                fullHeight
                size="lg"
            />
        );
    }

    if (isError && error) {
        return (
            <ErrorState
                title="Oops! Something went wrong"
                message={
                    error.message ||
                    "Failed to search grants. Please try again later."
                }
                variant="default"
                size="lg"
                onRetry={() => infiniteQuery.refetch()}
            />
        );
    }

    if (!allGrants.length) {
        return (
            <EmptyState
                title="No Results Found"
                message="Try adjusting your search terms or filters to find what you're looking for."
                variant="card"
                size="lg"
            />
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
                    <LoadingState
                        title=""
                        message="Loading more results..."
                        size="sm"
                    />
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
