// src/pages/SearchPage.tsx
import { useState, useCallback, useEffect } from "react";
import {
    Search as SearchIcon,
    BookmarkPlus,
    BookmarkCheck,
    Calendar,
    DollarSign,
    LineChart as ChartIcon,
    SlidersHorizontal,
    University,
    UserRoundSearch,
    X,
    FileSearch2,
    AlertCircle,
} from "lucide-react";
import { useGrantSearch } from "@/hooks/api/useGrants";
import { FilterPanel } from "@/components/features/grants/FilterPanel";
import { FilterTags } from "@/components/common/ui/FilterTags";
import { SearchResults } from "@/components/features/grants/SearchResults";
import { Card } from "@/components/common/ui/Card";
import { Button } from "@/components/common/ui/Button";
import { SortButton } from "@/components/common/ui/SortButton";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import type { SortConfig, GrantSearchParams } from "@/types/search";
import { cn } from "@/utils/cn";

export const SearchPage = () => {
    // Current search terms (what's shown in the input fields)
    const [searchTerms, setSearchTerms] = useState({
        recipient: "",
        institute: "",
        grant: "",
    });

    // Last searched terms (what was actually searched)
    const [lastSearchedTerms, setLastSearchedTerms] = useState({
        recipient: "",
        institute: "",
        grant: "",
    });

    const [showVisualization, setShowVisualization] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: "date",
        direction: "desc",
    });
    const [filters, setFilters] = useState(DEFAULT_FILTER_STATE);
    const [isInitialState, setIsInitialState] = useState(true);

    // Flag to indicate if search terms have changed but not been searched
    const [searchTermsChanged, setSearchTermsChanged] = useState(false);

    // Flag to indicate if a filter-based search should be triggered
    const [shouldTriggerFilterSearch, setShouldTriggerFilterSearch] =
        useState(false);

    // State for animation control
    const [showBanner, setShowBanner] = useState(false);

    // Create search params using the LAST SEARCHED terms (not current input values)
    // Using a ref here ensures we have the most up-to-date values when the search is executed
    const searchParams: GrantSearchParams = {
        searchTerms: lastSearchedTerms,
        filters,
        sortConfig,
    };

    // Initialize search query with enabled: false in useGrantSearch
    const { data, isLoading, error, refetch } = useGrantSearch({
        ...searchParams,
        sortConfig: {
            ...searchParams.sortConfig,
            field:
                searchParams.sortConfig.field === "results"
                    ? (() => {
                          throw new Error("Invalid sort field: results");
                      })()
                    : searchParams.sortConfig.field,
        },
    });

    // Check if search terms have changed from last search
    useEffect(() => {
        const hasChanged =
            searchTerms.recipient !== lastSearchedTerms.recipient ||
            searchTerms.institute !== lastSearchedTerms.institute ||
            searchTerms.grant !== lastSearchedTerms.grant;

        setSearchTermsChanged(hasChanged);

        // Control banner visibility with a slight delay for smoother transitions
        if (hasChanged && !isInitialState) {
            setShowBanner(true);
        } else {
            // Small delay to allow animation to complete
            setTimeout(() => {
                setShowBanner(false);
            }, 100);
        }
    }, [searchTerms, lastSearchedTerms, isInitialState]);

    // When search terms change in inputs, update state but don't trigger search
    const handleInputChange = (
        field: keyof typeof searchTerms,
        value: string
    ) => {
        setSearchTerms((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // This is the main search function that actually performs the search
    const handleSearch = useCallback(async () => {
        const hasSearchTerms = Object.values(searchTerms).some(
            (term) => term.trim() !== ""
        );
        const hasActiveFilters =
            filters.agencies.length > 0 ||
            filters.countries.length > 0 ||
            filters.provinces.length > 0 ||
            filters.cities.length > 0 ||
            filters.yearRange.start !== DEFAULT_FILTER_STATE.yearRange.start ||
            filters.yearRange.end !== DEFAULT_FILTER_STATE.yearRange.end ||
            filters.valueRange.min !== DEFAULT_FILTER_STATE.valueRange.min ||
            filters.valueRange.max !== DEFAULT_FILTER_STATE.valueRange.max;

        console.log("Search triggered:", {
            hasSearchTerms,
            hasActiveFilters,
            filters,
        });

        if (hasSearchTerms || hasActiveFilters) {
            // Update last searched terms first
            setLastSearchedTerms(searchTerms);
            setSearchTermsChanged(false);
            setIsInitialState(false);

            // Delay the refetch to ensure state updates have propagated
            // This is the key fix for the "need to click twice" issue
            setTimeout(() => {
                console.log(
                    "Executing delayed search with terms:",
                    searchTerms
                );
                refetch();
            }, 0);
        } else {
            setIsInitialState(true);
        }
    }, [searchTerms, filters, refetch]);

    // Filter changes should still trigger immediate search (keeping this behavior)
    const handleFilterChange = useCallback(
        (newFilters: typeof DEFAULT_FILTER_STATE) => {
            console.log("Filter change:", newFilters);
            setFilters(newFilters);
            setShouldTriggerFilterSearch(true);
        },
        []
    );

    // Effect to handle filter-based search
    useEffect(() => {
        if (shouldTriggerFilterSearch && !isInitialState) {
            console.log("Triggering search based on filter change");
            // Use a timeout to ensure state updates are processed
            setTimeout(() => {
                refetch();
            }, 0);
            setShouldTriggerFilterSearch(false);
        }
    }, [filters, shouldTriggerFilterSearch, isInitialState, refetch]);

    const handleSort = (field: SortConfig["field"]) => {
        setSortConfig((prev) => {
            const newConfig: SortConfig = {
                field,
                direction:
                    prev.field === field && prev.direction === "desc"
                        ? "asc"
                        : "desc",
            };
            return newConfig;
        });

        // Only trigger search if we've already done a search before
        if (!isInitialState) {
            refetch();
        }
    };

    const handleBookmark = useCallback((grantId: string) => {
        console.log("Bookmarking grant:", grantId);
    }, []);

    // Banner component that appears when search terms have changed
    const SearchTermsChangedBanner = () => {
        if (!showBanner && !searchTermsChanged) return null;

        return (
            <div
                className={cn(
                    "bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4",
                    "flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 justify-between",
                    "transition-all duration-300 ease-in-out",
                    searchTermsChanged && showBanner
                        ? "opacity-100 transform translate-y-0 scale-100"
                        : "opacity-0 transform -translate-y-4 scale-95 pointer-events-none"
                )}
            >
                <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-amber-700">
                        Search terms have changed. Search again to see updated
                        results.
                    </span>
                </div>
                <Button
                    className="w-full lg:w-auto border-dashed border-amber-400 text-amber-700 hover:bg-amber-100 hover:border-solid transition-all duration-200"
                    variant="outline"
                    icon={SearchIcon}
                    onClick={handleSearch}
                    size="sm"
                >
                    Search Again
                </Button>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-2 lg:p-6 space-y-6">
            {/* Search Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Advanced Search</h1>
                <Button
                    variant="outline"
                    icon={SlidersHorizontal}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
            </div>

            {/* Search Fields */}
            <div className="grid gap-4">
                {[
                    {
                        field: "recipient",
                        icon: UserRoundSearch,
                        placeholder: "Search by recipient...",
                    },
                    {
                        field: "institute",
                        icon: University,
                        placeholder: "Search by institute...",
                    },
                    {
                        field: "grant",
                        icon: FileSearch2,
                        placeholder: "Search by grant...",
                    },
                ].map(({ field, icon: Icon, placeholder }) => (
                    <div key={field} className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="search"
                            placeholder={placeholder}
                            value={
                                searchTerms[field as keyof typeof searchTerms]
                            }
                            onChange={(e) =>
                                handleInputChange(
                                    field as keyof typeof searchTerms,
                                    e.target.value
                                )
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                            className="w-full pl-10 pr-2.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
                        />
                    </div>
                ))}
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="transition-all duration-300 ease-in-out">
                    <Card className="p-4">
                        <FilterPanel
                            filters={filters}
                            onChange={handleFilterChange}
                        />
                    </Card>
                </div>
            )}

            {/* Filter Tags */}
            <FilterTags
                filters={filters}
                onRemove={(type, value) => {
                    const newFilters = { ...filters };
                    if (
                        Array.isArray(newFilters[type as keyof typeof filters])
                    ) {
                        (newFilters[type as keyof typeof filters] as string[]) =
                            (
                                newFilters[
                                    type as keyof typeof filters
                                ] as string[]
                            ).filter((v) => v !== value);
                    } else if (type === "yearRange") {
                        newFilters.yearRange = DEFAULT_FILTER_STATE.yearRange;
                    } else if (type === "valueRange") {
                        newFilters.valueRange = DEFAULT_FILTER_STATE.valueRange;
                    }
                    setFilters(newFilters);

                    // Trigger filter-based search if we're not in initial state
                    if (!isInitialState) {
                        setShouldTriggerFilterSearch(true);
                    }
                }}
                onClearAll={() => {
                    setFilters(DEFAULT_FILTER_STATE);

                    // Trigger filter-based search if we're not in initial state
                    if (!isInitialState) {
                        setShouldTriggerFilterSearch(true);
                    }
                }}
            />

            {/* Search Actions */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    icon={isBookmarked ? BookmarkCheck : BookmarkPlus}
                    onClick={() => setIsBookmarked(!isBookmarked)}
                >
                    Bookmark Search
                </Button>

                <Button
                    variant="primary"
                    icon={SearchIcon}
                    onClick={handleSearch}
                >
                    Search
                </Button>
            </div>

            {/* Results Header with Sort Controls */}
            <div className="flex items-center justify-between border-b pb-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-0 lg:space-y-1">
                    <h2 className="flex text-lg font-medium">
                        <span className="mr-1">Search</span>
                        <span className="mr-2">Results</span>
                    </h2>
                    {!isInitialState &&
                        !isLoading &&
                        data &&
                        data.length > 0 && (
                            <span className="flex text-sm text-gray-500 lg:ml-2">
                                <span>(</span>
                                <span>{data.length} results</span>
                                <span>)</span>
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
                        disabled={!data || data.length === 0}
                    >
                        {showVisualization ? "Hide Trends" : "Show Trends"}
                    </Button>
                </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
                {/* Search Terms Changed Banner */}
                <SearchTermsChangedBanner />

                <SearchResults
                    data={data}
                    isLoading={isLoading}
                    error={error}
                    onBookmark={handleBookmark}
                    showVisualization={showVisualization}
                    isInitialState={isInitialState}
                />
            </div>
        </div>
    );
};
