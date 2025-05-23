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
import { cn } from "@/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/common/ui/Button";
import { FilterPanel } from "@/components/features/filter/FilterPanel";
import { FilterTags } from "@/components/features/filter/FilterTags";
import { PopularSearchesPanel } from "@/components/features/search/PopularSearchesPanel";
import { SearchField } from "@/components/features/search/SearchField";
import { SearchCategory } from "@/types/search";
import { DEFAULT_FILTER_STATE, FilterKey } from "@/constants/filters";
import { Card } from "@/components/common/ui/Card";

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
            <Card
                role="alert"
                className={cn(
                    "bg-amber-50 border-dashed border-amber-500 rounded-3xl p-3.5 shadow-none",
                    "flex flex-inline gap-2 animate-bounce"
                )}
            >
                <AlertCircle className="inline-block h-4 w-4 mt-1 text-amber-500 flex-shrink-0" />
                <span className="text-amber-700 text-sm md:text-base">
                    Search terms have changed. Press the search button to see
                    updated results.
                </span>
            </Card>
        );
    };

    return (
        <div className={cn("flex flex-col gap-2 md:gap-3 lg:gap-4", className)}>
            {/* Search Fields */}
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

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
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
                                    ? "bg-blue-100 hover:bg-blue-200 text-blue-600 border border-blue-300"
                                    : "bg-white shadow-sm hover:text-blue-600 hover:border-blue-300"
                            )}
                            responsiveText="firstWord"
                        >
                            Popular Searches
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
                                ? "bg-blue-100 hover:bg-blue-200 text-blue-600 border border-blue-300"
                                : "bg-white shadow-sm hover:text-blue-600 hover:border-blue-300"
                        )}
                        responsiveText="hideOnMobile"
                    >
                        Filters
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
                                    ? "bg-blue-100 hover:bg-blue-100 text-blue-600 border border-blue-300"
                                    : "hover:bg-blue-50 hover:text-blue-600"
                            )}
                            responsiveText="hideOnMobile"
                        >
                            Bookmark Search
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
            <div className="transition-all duration-300 ease-in-out pb-2">
                <AnimatePresence>
                    {activePanelType === "filters" && filters && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                            style={{ overflow: "hidden" }}
                        >
                            <FilterPanel
                                filters={filters}
                                onChange={handleFilterChange}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {activePanelType === "popular" && showPopularSearches && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                            style={{ overflow: "hidden" }}
                        >
                            <PopularSearchesPanel
                                onSelect={handlePopularSearchSelect}
                                isVisible={activePanelType === "popular"}
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
