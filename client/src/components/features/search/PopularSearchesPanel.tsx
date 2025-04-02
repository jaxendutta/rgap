// src/components/features/search/PopularSearchesPanel.tsx
import { useState, useEffect } from "react";
import {
    UserRoundSearch,
    University,
    FileSearch2,
    BookMarked,
    Info,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Card } from "@/components/common/ui/Card";
import { DateRangeFilter } from "@/components/common/ui/DateRangeFilter";
import LoadingState from "@/components/common/ui/LoadingState";
import Button from "@/components/common/ui/Button";
import { Tag } from "@/components/common/ui/Tag";
import usePopularSearches, {
    SearchCategory,
    PopularSearchTerm,
} from "@/hooks/usePopularSearches";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";

interface PopularSearchesPanelProps {
    onSelect: (category: SearchCategory, term: string) => void;
    isVisible?: boolean;
}

export const PopularSearchesPanel = ({
    onSelect,
    isVisible = true,
}: PopularSearchesPanelProps) => {
    const [activeCategory, setActiveCategory] =
        useState<SearchCategory>("recipient");
    const [dateRange, setDateRange] = useState({
        from: DEFAULT_FILTER_STATE.dateRange.from,
        to: DEFAULT_FILTER_STATE.dateRange.to,
    });
    const [initialLoad, setInitialLoad] = useState(false);

    // Use our custom hook with the enabled flag tied to visibility
    const { popularSearches, isLoading, error, refetch } = usePopularSearches({
        dateRange,
        enabled: isVisible, // Only fetch when the panel is visible
    });

    // Handle date range change
    const handleDateRangeChange = (newRange: { from: Date; to: Date }) => {
        console.log("Date range changed:", newRange);
        setDateRange(newRange);
    };

    // Force data fetch when the panel becomes visible for the first time
    useEffect(() => {
        if (isVisible && !initialLoad) {
            console.log("Panel became visible, triggering fetch");
            refetch();
            setInitialLoad(true);
        }
    }, [isVisible, initialLoad, refetch]);

    return (
        <Card className="p-4">
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
                    <h3 className="text-md font-medium">Popular Searches</h3>

                    {/* Date Range Selector */}
                    <DateRangeFilter
                        label="Time Period"
                        value={dateRange}
                        onChange={handleDateRangeChange}
                    />
                </div>

                {/* Category Tabs */}
                <div className="flex border-b mb-4">
                    <button
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center",
                            activeCategory === "recipient"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                        onClick={() => setActiveCategory("recipient")}
                    >
                        <UserRoundSearch className="h-4 w-4 mr-2" />
                        Recipients
                    </button>

                    <button
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center",
                            activeCategory === "institute"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                        onClick={() => setActiveCategory("institute")}
                    >
                        <University className="h-4 w-4 mr-2" />
                        Institutes
                    </button>

                    <button
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center",
                            activeCategory === "grant"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                        onClick={() => setActiveCategory("grant")}
                    >
                        <FileSearch2 className="h-4 w-4 mr-2" />
                        Grants
                    </button>
                </div>

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
                {error && !isLoading && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-2">
                        <p className="flex items-center">
                            <Info className="h-4 w-4 mr-2 text-red-500" />
                            {error}
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={RefreshCw}
                            onClick={() => refetch()}
                            className="mt-2"
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                {/* Search Terms List */}
                {!isLoading && !error && (
                    <div className="space-y-2">
                        {popularSearches[activeCategory].length > 0 ? (
                            popularSearches[activeCategory].map(
                                (term: PopularSearchTerm, index: number) => (
                                    <Button
                                        variant="ghost"
                                        pill={true}
                                        key={index}
                                        onClick={() =>
                                            onSelect(activeCategory, term.text)
                                        }
                                        className="flex items-center justify-between w-full p-1 lg:p-2 hover:bg-gray-50 transition-colors text-left"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Tag
                                                variant="default"
                                                pill={true}
                                                className="mr-1"
                                            >
                                                #{index + 1}
                                            </Tag>
                                            <Tag
                                                variant="link"
                                                pill={true}
                                                className="truncate w-min-0"
                                            >
                                                {term.text}
                                            </Tag>
                                        </span>
                                        <Tag
                                            variant="secondary"
                                            pill={true}
                                            className="text-xs bg-gray-100 px-2 py-1 rounded-full ml-2 flex-shrink-0"
                                        >
                                            {term.count} searches
                                        </Tag>
                                    </Button>
                                )
                            )
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                <BookMarked className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p>
                                    No popular searches found for this period.
                                </p>
                                <p className="text-sm mt-1">
                                    Try selecting a different date range.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default PopularSearchesPanel;
