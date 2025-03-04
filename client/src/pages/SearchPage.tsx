// src/pages/SearchPage.tsx
import { useState } from "react";
import {
    Calendar,
    DollarSign,
    LineChart as ChartIcon,
    X,
    GraduationCap,
    University,
    FileSearch2,
} from "lucide-react";
import { useInfiniteGrantSearch } from "@/hooks/api/useGrants";
import { Button } from "@/components/common/ui/Button";
import { SearchResults } from "@/components/features/grants/SearchResults";
import { SortButton } from "@/components/common/ui/SortButton";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import type { GrantSortConfig, GrantSearchParams } from "@/types/search";
import SearchInterface from "@/components/features/search/SearchInterface";
import PageHeader from "@/components/common/layout/PageHeader";
import PageContainer from "@/components/common/layout/PageContainer";

export const SearchPage = () => {
    // Current search terms (what's shown in the input fields)
    const [searchTerms, setSearchTerms] = useState({
        recipient: "",
        institute: "",
        grant: "",
    });

    // UI state controls
    const [showVisualization, setShowVisualization] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [sortConfig, setSortConfig] = useState<GrantSortConfig>({
        field: "date",
        direction: "desc",
    });
    const [filters, setFilters] = useState(DEFAULT_FILTER_STATE);
    const [isInitialState, setIsInitialState] = useState(true);

    // Create search params
    const searchParams: Omit<GrantSearchParams, "pagination"> = {
        searchTerms,
        filters,
        sortConfig,
    };

    // Initialize infinite query
    const infiniteQueryResult = useInfiniteGrantSearch(searchParams);

    const handleSearch = (params: {
        searchTerms: Record<string, string>;
        filters: typeof DEFAULT_FILTER_STATE;
    }) => {
        setSearchTerms(
            params.searchTerms as {
                recipient: string;
                institute: string;
                grant: string;
            }
        );
        setFilters(params.filters);
        setIsInitialState(false);

        // Refetch with updated parameters
        setTimeout(() => {
            infiniteQueryResult.refetch();
        }, 0);
    };

    const handleSort = (field: "date" | "value") => {
        setSortConfig((prev) => ({
            field,
            direction:
                prev.field === field && prev.direction === "desc"
                    ? "asc"
                    : "desc",
        }));

        // Only trigger search if we've already done a search before
        if (!isInitialState) {
            setTimeout(() => {
                infiniteQueryResult.refetch();
            }, 0);
        }
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        // Implement the actual bookmark functionality here
    };

    const handleBookmarkGrant = (grantId: string) => {
        console.log("Bookmarking grant:", grantId);
        // Implement grant bookmarking here
    };

    return (
        <PageContainer>
            {/* Header */}
            <PageHeader title="Advanced Grant Search" />

            {/* Search Interface */}
            <SearchInterface
                fields={[
                    {
                        key: "recipient",
                        icon: GraduationCap,
                        placeholder: "Search by recipient...",
                    },
                    {
                        key: "institute",
                        icon: University,
                        placeholder: "Search by institute...",
                    },
                    {
                        key: "grant",
                        icon: FileSearch2,
                        placeholder: "Search by grant...",
                    },
                ]}
                initialValues={searchTerms}
                filters={filters}
                onSearch={handleSearch}
                onBookmark={handleBookmark}
                isBookmarked={isBookmarked}
                isInitialState={isInitialState}
                showPopularSearches={true}
            />

            {/* Results Header with Sort Controls */}
            <div className="flex items-center justify-between border-b pb-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-0 lg:space-y-1">
                    <h2 className="flex text-lg font-medium">
                        <span className="hidden lg:flex mr-1">Search</span>
                        <span>Results</span>
                    </h2>
                    {!isInitialState &&
                        !infiniteQueryResult.isLoading &&
                        infiniteQueryResult.data &&
                        infiniteQueryResult.data.pages[0]?.data.length > 0 && (
                            <span className="flex text-sm text-gray-500 lg:ml-2">
                                <span className="hidden lg:flex">(</span>
                                <span>
                                    {
                                        infiniteQueryResult.data.pages[0]
                                            .metadata.totalCount
                                    }{" "}
                                    results
                                </span>
                                <span className="hidden lg:flex">)</span>
                            </span>
                        )}
                </div>
                <div className="flex items-center space-x-2">
                    <SortButton
                        label="Date"
                        icon={Calendar}
                        field="date"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onClick={() => handleSort("date")}
                    />
                    <SortButton
                        label="Value"
                        icon={DollarSign}
                        field="value"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onClick={() => handleSort("value")}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        icon={showVisualization ? X : ChartIcon}
                        onClick={() => setShowVisualization(!showVisualization)}
                        disabled={
                            isInitialState ||
                            !infiniteQueryResult.data ||
                            infiniteQueryResult.data.pages[0]?.data.length === 0
                        }
                    >
                        {showVisualization ? "Hide Trends" : "Show Trends"}
                    </Button>
                </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
                {/* Search Results with infinite scroll */}
                <SearchResults
                    infiniteQuery={infiniteQueryResult}
                    onBookmark={handleBookmarkGrant}
                    showVisualization={showVisualization}
                    isInitialState={isInitialState}
                />
            </div>
        </PageContainer>
    );
};
