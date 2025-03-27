// src/components/features/search/SearchInterface.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
    Search as SearchIcon,
    BookmarkPlus,
    BookmarkCheck,
    SlidersHorizontal,
    AlertCircle,
    Sparkles,
    LucideIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/common/ui/Button";
import { Card } from "@/components/common/ui/Card";
import { FilterPanel } from "@/components/features/filter/FilterPanel";
import { FilterTags } from "@/components/features/filter/FilterTags";
import { DEFAULT_FILTER_STATE, FilterKey } from "@/constants/filters";
import {
    PopularSearchesPanel,
    SearchCategory,
} from "@/components/features/search/PopularSearchesPanel";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { SearchField } from "@/components/common/ui/SearchField";

export interface SearchField {
    key: string;
    icon: LucideIcon;
    placeholder: string;
}

export interface SearchInterfaceProps {
    fields: SearchField[];
    initialValues?: Record<string, string>;
    filters?: typeof DEFAULT_FILTER_STATE;
    onSearch: (values: {
        searchTerms: Record<string, string>;
        filters: typeof DEFAULT_FILTER_STATE;
        userId?: number;
    }) => void;
    onBookmark?: () => void;
    isBookmarked?: boolean;
    showPopularSearches?: boolean;
    isInitialState?: boolean;
    className?: string;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
    fields,
    initialValues = {},
    filters: initialFilters = DEFAULT_FILTER_STATE,
    onSearch,
    onBookmark,
    isBookmarked = false,
    showPopularSearches = true,
    isInitialState = true,
    className,
}) => {
    // Get the current user
    const { user } = useAuth();

    // Current search terms
    const [searchTerms, setSearchTerms] = useState<Record<string, string>>(
        fields.reduce((acc, field) => {
            acc[field.key] = initialValues[field.key] || "";
            return acc;
        }, {} as Record<string, string>)
    );

    // Last searched terms (for change detection)
    const [lastSearchedTerms, setLastSearchedTerms] =
        useState<Record<string, string>>(searchTerms);

    // Filter state
    const [filters, setFilters] = useState(initialFilters);
    const [lastSearchedFilters, setLastSearchedFilters] =
        useState(initialFilters);

    // UI state for panels
    const [activePanelType, setActivePanelType] = useState<
        "none" | "filters" | "popular"
    >("none");

    // Change detection
    const [searchTermsChanged, setSearchTermsChanged] = useState(false);
    const [filtersChanged, setFiltersChanged] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    // Check if search terms or filters have changed since last search
    useEffect(() => {
        if (isInitialState) {
            setSearchTermsChanged(false);
            setFiltersChanged(false);
            setShowBanner(false);

            // If this is initial state with values, let's set lastSearched values to match
            // so we don't immediately show the "Search terms changed" banner
            if (Object.values(searchTerms).some((val) => val)) {
                setLastSearchedTerms(searchTerms);
            }
            if (
                JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTER_STATE)
            ) {
                setLastSearchedFilters(filters);
            }

            return;
        }

        // Check if search terms have changed
        let termsChanged = false;
        Object.keys(searchTerms).forEach((key) => {
            if (searchTerms[key] !== lastSearchedTerms[key]) {
                termsChanged = true;
            }
        });

        // Check if filters have changed
        let filtersHaveChanged =
            JSON.stringify(filters) !== JSON.stringify(lastSearchedFilters);

        // Only update changed states if there's an actual change
        if (termsChanged !== searchTermsChanged) {
            setSearchTermsChanged(termsChanged);
        }

        if (filtersHaveChanged !== filtersChanged) {
            setFiltersChanged(filtersHaveChanged);
        }

        // Don't toggle the banner state repeatedly - only set it to true once when changes are detected
        // and only set it to false when explicitly clearing it
        if ((termsChanged || filtersHaveChanged) && !showBanner) {
            setShowBanner(true);
        }
    }, [
        searchTerms,
        lastSearchedTerms,
        filters,
        lastSearchedFilters,
        isInitialState,
        searchTermsChanged,
        filtersChanged,
        showBanner,
    ]);

    // Handle input changes
    const handleInputChange = (field: string, value: string) => {
        setSearchTerms((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle filter changes
    const handleFilterChange = useCallback(
        (newFilters: typeof DEFAULT_FILTER_STATE) => {
            setFilters(newFilters);

            // Always trigger search immediately on filter changes
            // removing the isInitialState condition
            setTimeout(() => {
                onSearch({
                    searchTerms,
                    filters: newFilters,
                });

                // Update last searched values
                setLastSearchedFilters(newFilters);
                setSearchTermsChanged(false);
                setFiltersChanged(false);
                setShowBanner(false);
            }, 0);
        },
        [onSearch, searchTerms]
    );

    // Handle filter removal
    const handleRemoveFilter = useCallback(
        (type: FilterKey, value: string) => {
            const newFilters = { ...filters };

            if (Array.isArray(newFilters[type])) {
                (newFilters[type] as string[]) = (
                    newFilters[type] as string[]
                ).filter((v) => v !== value);
            } else if (type === "dateRange") {
                newFilters.dateRange = DEFAULT_FILTER_STATE.dateRange;
            } else if (type === "valueRange") {
                newFilters.valueRange = DEFAULT_FILTER_STATE.valueRange;
            }

            setFilters(newFilters);

            // Always trigger search immediately on filter changes
            // removing the isInitialState condition
            setTimeout(() => {
                onSearch({
                    searchTerms,
                    filters: newFilters,
                });

                // Update last searched values
                setLastSearchedFilters(newFilters);
                setSearchTermsChanged(false);
                setFiltersChanged(false);
                setShowBanner(false);
            }, 0);
        },
        [filters, onSearch, searchTerms]
    );

    // Handle clear all filters
    const handleClearFilters = useCallback(() => {
        setFilters(DEFAULT_FILTER_STATE);

        // Always trigger search immediately on filter changes
        // removing the isInitialState condition
        setTimeout(() => {
            onSearch({
                searchTerms,
                filters: DEFAULT_FILTER_STATE,
            });

            // Update last searched values
            setLastSearchedFilters(DEFAULT_FILTER_STATE);
            setSearchTermsChanged(false);
            setFiltersChanged(false);
            setShowBanner(false);
        }, 0);
    }, [onSearch, searchTerms]);

    // Handle selecting a popular search term
    const handlePopularSearchSelect = (
        category: SearchCategory,
        term: string
    ) => {
        // Map the search category to the corresponding field key
        const fieldKey = category;

        // Update the search term
        setSearchTerms((prev) => ({
            ...prev,
            [fieldKey]: term,
        }));

        // Close the panel
        setActivePanelType("none");

        // Focus on the search button
        document.getElementById("search-button")?.focus();
    };

    // Toggle panel visibility
    const togglePanel = (panelType: "filters" | "popular") => {
        setActivePanelType((prev) => (prev === panelType ? "none" : panelType));
    };

    // Perform the actual search
    const performSearch = () => {
        // Update last searched terms and filters
        setLastSearchedTerms(searchTerms);
        setLastSearchedFilters(filters);
        setSearchTermsChanged(false);
        setFiltersChanged(false);
        setShowBanner(false);

        // Close panels
        setActivePanelType("none");

        // Call the search handler with the user ID
        onSearch({
            searchTerms,
            filters,
            userId: user?.user_id, // Include user ID for search history
        });
    };

    // Banner component for changed search terms
    const SearchTermsChangedBanner = () => {
        if (!showBanner || isInitialState) return null;

        return (
            <div
                className={cn(
                    "bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4",
                    "flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 justify-between"
                )}
            >
                <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-amber-700">
                        Search terms have changed. Search again to see updated
                        results.
                    </span>
                </div>
                <Button
                    className="w-full lg:w-auto border-dashed border-amber-400 text-amber-700 hover:bg-amber-100 hover:border-solid transition-all duration-200"
                    variant="outline"
                    leftIcon={SearchIcon}
                    onClick={performSearch}
                    size="sm"
                >
                    Search Again
                </Button>
            </div>
        );
    };

    return (
        <div className={className}>
            {/* Search Fields */}
            <div className="grid gap-4">
                {fields.map(({ key, icon: Icon, placeholder }: SearchField) => (
                    <SearchField
                        key={key}
                        icon={Icon}
                        placeholder={placeholder}
                        value={searchTerms[key] || ""}
                        onChange={(value) => handleInputChange(key, value)}
                        onEnter={performSearch}
                    />
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3 border-b pb-3 mt-4">
                {/* Left side - Panel Controls */}
                <div className="flex gap-2">
                    {showPopularSearches && (
                        <Button
                            variant={
                                activePanelType === "popular"
                                    ? "primary"
                                    : "secondary"
                            }
                            leftIcon={Sparkles}
                            onClick={() => togglePanel("popular")}
                            className={cn(
                                activePanelType === "popular"
                                    ? "bg-blue-100 hover:bg-blue-100 rounded-full text-blue-600 border border-blue-300"
                                    : "shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:rounded-full"
                            )}
                        >
                            <span>
                                Popular
                                <span className="hidden lg:inline">
                                    {" "}
                                    Searches
                                </span>
                            </span>
                        </Button>
                    )}
                    <Button
                        variant={
                            activePanelType === "filters"
                                ? "primary"
                                : "secondary"
                        }
                        leftIcon={SlidersHorizontal}
                        onClick={() => togglePanel("filters")}
                        className={cn(
                            activePanelType === "filters"
                                ? "bg-blue-100 hover:bg-blue-100 rounded-full text-blue-600 border border-blue-300"
                                : "shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:rounded-full"
                        )}
                    >
                        <span className="hidden lg:inline">Filters</span>
                    </Button>
                </div>

                {/* Right side - Actions */}
                <div className="flex gap-2 ml-auto">
                    {onBookmark && (
                        <Button
                            variant="secondary"
                            leftIcon={
                                isBookmarked ? BookmarkCheck : BookmarkPlus
                            }
                            onClick={onBookmark}
                            className={cn(
                                isBookmarked
                                    ? "bg-blue-100 hover:bg-blue-100 rounded-full text-blue-600 border border-blue-300"
                                    : "shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:rounded-full"
                            )}
                        >
                            <span className="hidden lg:inline">Bookmark</span>
                        </Button>
                    )}
                    <Button
                        id="search-button"
                        variant="primary"
                        leftIcon={SearchIcon}
                        onClick={performSearch}
                        className="bg-gray-900 hover:bg-gray-800"
                    >
                        Search
                    </Button>
                </div>
            </div>

            {/* Panels Area */}
            <div className="transition-all duration-800 ease-in-out mt-4 relative">
                <AnimatePresence>
                    {activePanelType === "filters" && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="p-4 mb-4">
                                <FilterPanel
                                    filters={filters}
                                    onChange={handleFilterChange}
                                />
                            </Card>
                        </motion.div>
                    )}

                    {activePanelType === "popular" && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <PopularSearchesPanel
                                onSelect={handlePopularSearchSelect}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Filter Tags */}
            <FilterTags
                filters={filters}
                onRemove={handleRemoveFilter}
                onClearAll={handleClearFilters}
            />

            {/* Changed Search Banner */}
            <AnimatePresence>
                {(searchTermsChanged || filtersChanged) && (
                    <SearchTermsChangedBanner />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchInterface;
