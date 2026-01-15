// src/components/features/search/SearchInterface.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    LuSearch,
    LuSlidersHorizontal,
    LuSparkles,
    LuCircleAlert,
} from 'react-icons/lu';
import { IconType } from 'react-icons';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FilterPanel } from '@/components/filter/FilterPanel';
import { FilterTags } from '@/components/filter/FilterTags';
import { PopularSearchesPanel } from '@/components/search/PopularSearchesPanel';
import { SearchField } from '@/components/search/SearchField';
import { DEFAULT_FILTER_STATE, type FilterKey } from '@/constants/filters';

// --- Explicitly typed as Variants ---
const panelVariants: Variants = {
    hidden: {
        height: 0,
        opacity: 0,
        overflow: 'hidden',
        transition: { duration: 0.3, ease: 'easeInOut' }
    },
    visible: {
        height: 'auto',
        opacity: 1,
        overflow: 'hidden',
        transition: { duration: 0.3, ease: 'easeInOut' },
        transitionEnd: {
            overflow: 'visible'
        }
    },
    exit: {
        height: 0,
        opacity: 0,
        overflow: 'hidden',
        transition: { duration: 0.2, ease: 'easeInOut' }
    }
};

interface SearchFieldConfig {
    key: string;
    icon: IconType;
    placeholder: string;
}

interface FilterOptions {
    agencies: string[];
    countries: string[];
    provinces: string[];
    cities: string[];
}

interface SearchInterfaceProps {
    fields: SearchFieldConfig[];
    filterOptions: FilterOptions;
    initialValues?: Record<string, string>;
    initialFilters?: typeof DEFAULT_FILTER_STATE;
    onSearch: (params: {
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

export default function SearchInterface({
    fields,
    filterOptions,
    initialValues = {},
    initialFilters = DEFAULT_FILTER_STATE,
    onSearch,
    onBookmark,
    isBookmarked = false,
    showPopularSearches = true,
    isInitialState = true,
    className,
}: SearchInterfaceProps) {
    // Search terms state
    const [searchTerms, setSearchTerms] = useState<Record<string, string>>(
        fields.reduce((acc, field) => {
            acc[field.key] = initialValues[field.key] || '';
            return acc;
        }, {} as Record<string, string>)
    );

    const [lastSearchedTerms, setLastSearchedTerms] = useState<Record<string, string>>(searchTerms);

    // Filter state
    const [filters, setFilters] = useState(initialFilters);
    const [lastSearchedFilters, setLastSearchedFilters] = useState(initialFilters);

    // UI state
    const [activePanelType, setActivePanelType] = useState<'none' | 'filters' | 'popular'>('none');
    const [searchTermsChanged, setSearchTermsChanged] = useState(false);
    const [filtersChanged, setFiltersChanged] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    // Detect changes
    useEffect(() => {
        if (isInitialState) {
            setSearchTermsChanged(false);
            setFiltersChanged(false);
            setShowBanner(false);
            setLastSearchedTerms(searchTerms);
            setLastSearchedFilters(filters);
            return;
        }

        const termsChanged = JSON.stringify(searchTerms) !== JSON.stringify(lastSearchedTerms);
        const filtersChanged = JSON.stringify(filters) !== JSON.stringify(lastSearchedFilters);

        setSearchTermsChanged(termsChanged);
        setFiltersChanged(filtersChanged);
        setShowBanner(termsChanged || filtersChanged);
    }, [searchTerms, filters, lastSearchedTerms, lastSearchedFilters, isInitialState]);

    // Handlers
    const handleInputChange = (field: string, value: string) => {
        setSearchTerms(prev => ({ ...prev, [field]: value }));
    };

    const handleFilterChange = useCallback((newFilters: typeof DEFAULT_FILTER_STATE) => {
        setFilters(newFilters);

        // Auto-search on filter change
        setTimeout(() => {
            onSearch({ searchTerms, filters: newFilters });
            setLastSearchedFilters(newFilters);
            setSearchTermsChanged(false);
            setFiltersChanged(false);
            setShowBanner(false);
        }, 0);
    }, [onSearch, searchTerms]);

    const handleRemoveFilter = useCallback((type: FilterKey, value: string) => {
        const newFilters = { ...filters };

        if (Array.isArray(newFilters[type])) {
            (newFilters[type] as string[]) = (newFilters[type] as string[]).filter(v => v !== value);
        } else if (type === 'dateRange') {
            newFilters.dateRange = DEFAULT_FILTER_STATE.dateRange;
        } else if (type === 'valueRange') {
            newFilters.valueRange = DEFAULT_FILTER_STATE.valueRange;
        }

        setFilters(newFilters);
        handleFilterChange(newFilters);
    }, [filters, handleFilterChange]);

    const handleClearFilters = useCallback(() => {
        setFilters(DEFAULT_FILTER_STATE);
        handleFilterChange(DEFAULT_FILTER_STATE);
    }, [handleFilterChange]);

    const handlePopularSearchSelect = (category: string, term: string) => {
        setSearchTerms(prev => ({ ...prev, [category]: term }));
        setActivePanelType('none');
        document.getElementById('search-button')?.focus();
    };

    const togglePanel = (panelType: 'filters' | 'popular') => {
        setActivePanelType(prev => (prev === panelType ? 'none' : panelType));
    };

    const performSearch = () => {
        setLastSearchedTerms(searchTerms);
        setLastSearchedFilters(filters);
        setSearchTermsChanged(false);
        setFiltersChanged(false);
        setShowBanner(false);
        setActivePanelType('none');

        onSearch({ searchTerms, filters });
    };

    return (
        <div className={cn('flex flex-col gap-2 md:gap-3 lg:gap-4', className)}>
            {/* Search Fields */}
            {fields.map(({ key, icon, placeholder }) => (
                <SearchField
                    key={key}
                    icon={icon}
                    placeholder={placeholder}
                    value={searchTerms[key] || ''}
                    onChange={(value) => handleInputChange(key, value)}
                    onEnter={performSearch}
                />
            ))}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="flex gap-2">
                    {showPopularSearches && (
                        <Button
                            variant={activePanelType === 'popular' ? 'primary' : 'secondary'}
                            leftIcon={LuSparkles}
                            onClick={() => togglePanel('popular')}
                            className={cn(
                                "py-1.75 md:py-2.5",
                                activePanelType === 'popular'
                                    ? 'bg-blue-100 hover:bg-blue-200 text-blue-600 border border-blue-300'
                                    : 'bg-white shadow-sm hover:text-blue-600 hover:border-blue-300'
                            )}
                        >
                            Popular
                        </Button>
                    )}
                    <Button
                        variant={activePanelType === 'filters' ? 'primary' : 'secondary'}
                        leftIcon={LuSlidersHorizontal}
                        onClick={() => togglePanel('filters')}
                        className={cn(
                            "py-1.75 md:py-2.5",
                            activePanelType === 'filters'
                                ? 'bg-blue-100 hover:bg-blue-200 text-blue-600 border border-blue-300'
                                : 'bg-white shadow-sm hover:text-blue-600 hover:border-blue-300'
                        )}
                    >
                        Filters
                    </Button>
                </div>

                <div className="flex gap-2 ml-auto">
                    <Button
                        id="search-button"
                        variant="primary"
                        leftIcon={LuSearch}
                        onClick={performSearch}
                        className="bg-gray-900 hover:bg-black py-1.75 md:py-2.5"
                    >
                        Search
                    </Button>
                </div>
            </div>

            {/* Panels with Animation Logic */}
            <div className="transition-all duration-300 ease-in-out pb-2">
                <AnimatePresence>
                    {activePanelType === 'filters' && (
                        <motion.div
                            variants={panelVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <FilterPanel
                                filters={filters}
                                filterOptions={filterOptions}
                                onChange={handleFilterChange}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {activePanelType === 'popular' && showPopularSearches && (
                        <motion.div
                            variants={panelVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
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

            {/* Change Banner */}
            <AnimatePresence>
                {(searchTermsChanged || filtersChanged) && showBanner && !isInitialState && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Card className="bg-amber-50 border-dashed border-amber-500 rounded-lg p-3.5 shadow-none">
                            <div className="flex gap-2">
                                <LuCircleAlert className="h-4 w-4 mt-1 text-amber-500 flex-shrink-0" />
                                <span className="text-amber-700 text-sm">
                                    Search terms have changed. Press the search button to see updated results.
                                </span>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
