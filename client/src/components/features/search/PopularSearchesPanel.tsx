// src/components/features/search/PopularSearchesPanel.tsx
import { useState, useEffect } from "react";
import {
    UserRoundSearch,
    University,
    FileSearch2,
    BookMarked,
    Info,
    RefreshCw,
    ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/common/ui/Card";
import LoadingState from "@/components/common/ui/LoadingState";
import Button from "@/components/common/ui/Button";
import Tag from "@/components/common/ui/Tag";
import Tabs from "@/components/common/ui/Tabs";
import EmptyState from "@/components/common/ui/EmptyState";
import { usePopularSearches } from "@/hooks/api/usePopularSearches";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import { PopularSearch, SearchCategory } from "@/types/search";

interface PopularSearchesPanelProps {
    onSelect: (category: SearchCategory, term: string) => void;
    isVisible?: boolean;
}

const PopularSearchesPanelCard = ({
    term,
    index,
    activeCategory,
    onSelect,
}: {
    term: PopularSearch;
    index: number;
    activeCategory: SearchCategory;
    onSelect: (category: SearchCategory, term: string) => void;
}) => {
    return (
        <Button
            variant="ghost"
            key={index}
            onClick={() => onSelect(activeCategory, term.text)}
            className="flex items-center justify-between w-full p-1 lg:p-2 hover:bg-gray-50 transition-colors text-left"
        >
            <span className="flex items-center gap-2">
                <Tag
                    variant="default"
                    className="mr-1"
                    text={`#${index + 1}`}
                />
                <Tag
                    variant="link"
                    className="truncate w-min-0"
                    text={term.text}
                />
            </span>
            <Tag
                variant="secondary"
                className="text-xs bg-gray-100 px-2 py-1 rounded-full ml-2 flex-shrink-0"
                text={`${term.count} searches`}
            />
        </Button>
    );
};

export const PopularSearchesPanel = ({
    onSelect,
    isVisible = true,
}: PopularSearchesPanelProps) => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] =
        useState<SearchCategory>("recipient");
    const [initialLoad, setInitialLoad] = useState(false);

    // Use our updated hook with the category filter
    const popularSearchesQuery = usePopularSearches({
        dateRange: DEFAULT_FILTER_STATE.dateRange,
        category: activeCategory,
        enabled: isVisible, // Only fetch when the panel is visible
        limit: 5, // Limit to top 5 items per category
    });

    // Extract data and loading state from the query
    const isLoading = popularSearchesQuery.isLoading;
    const isError = popularSearchesQuery.isError;
    const error = popularSearchesQuery.error;
    const popularSearches = popularSearchesQuery.data?.pages[0].data || [];

    // Define the tabs configuration
    const tabs = [
        {
            id: "recipient",
            label: "Recipients",
            icon: UserRoundSearch,
        },
        {
            id: "institute",
            label: "Institutes",
            icon: University,
        },
        {
            id: "grant",
            label: "Grants",
            icon: FileSearch2,
        },
    ];

    // Force data fetch when the panel becomes visible for the first time
    useEffect(() => {
        if (isVisible && !initialLoad) {
            console.log("Panel became visible, triggering fetch");
            popularSearchesQuery.refetch();
            setInitialLoad(true);
        }
    }, [isVisible, initialLoad, popularSearchesQuery]);

    return (
        <Card className="p-4">
            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-md font-medium">Popular Searches</h3>

                    {/* Popular Searches Page */}
                    <Button
                        variant="outline"
                        size="sm"
                        rightIcon={ChevronRight}
                        onClick={() => {
                            navigate(
                                `/search/popular?category=${activeCategory}`
                            );
                        }}
                    >
                        View All
                    </Button>
                </div>

                {/* Category Tabs using Tabs component */}
                <Tabs
                    tabs={tabs}
                    activeTab={activeCategory}
                    onChange={(tabId) =>
                        setActiveCategory(tabId as SearchCategory)
                    }
                    variant="pills"
                    size="sm"
                    fullWidth={true}
                />

                {/* Loading State */}
                {isLoading && (
                    <div className="py-6">
                        <LoadingState
                            title="Loading popular searches"
                            message="Please wait..."
                            size="sm"
                        />
                    </div>
                )}

                {/* Error State */}
                {isError && !isLoading && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-2">
                        <p className="flex items-center">
                            <Info className="h-4 w-4 mr-2 text-red-500" />
                            {error instanceof Error
                                ? error.message
                                : "Failed to load popular searches"}
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={RefreshCw}
                            onClick={() => popularSearchesQuery.refetch()}
                            className="mt-2"
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                {/* Search Terms List */}
                {!isLoading && !isError && (
                    <div className="space-y-2">
                        {popularSearches.length > 0 ? (
                            popularSearches.map(
                                (term: PopularSearch, index: number) => (
                                    <PopularSearchesPanelCard
                                        key={index}
                                        term={term}
                                        index={index}
                                        activeCategory={activeCategory}
                                        onSelect={onSelect}
                                    />
                                )
                            )
                        ) : (
                            <EmptyState
                                title="No popular searches"
                                message="No popular searches found for this period. Try selecting a different date range."
                                icon={BookMarked}
                                size="sm"
                            />
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default PopularSearchesPanel;
