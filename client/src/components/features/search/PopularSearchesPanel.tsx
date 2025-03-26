// src/components/features/search/PopularSearchesPanel.tsx
import { useState, useEffect } from "react";
import {
    UserRoundSearch,
    University,
    FileSearch2,
    BookMarked,
    Info,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Card } from "@/components/common/ui/Card";
import { DateRangeFilter } from "@/components/common/ui/DateRangeFilter";
import { formatDate } from "@/utils/format";
import LoadingState from "@/components/common/ui/LoadingState";
import createAPI from "@/utils/api";

const API = createAPI();

export type SearchCategory = "recipient" | "institute" | "grant";

interface PopularSearchTerm {
    text: string;
    count: number;
}

interface PopularSearchesPanelProps {
    onSelect: (category: SearchCategory, term: string) => void;
}

// Default date range - last 30 days to current date
const getDefaultDateRange = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return { from: thirtyDaysAgo, to: today };
};

export const PopularSearchesPanel = ({
    onSelect,
}: PopularSearchesPanelProps) => {
    const [activeCategory, setActiveCategory] =
        useState<SearchCategory>("recipient");
    const [dateRange, setDateRange] = useState(getDefaultDateRange());
    const [popularSearches, setPopularSearches] = useState<
        Record<SearchCategory, PopularSearchTerm[]>
    >({
        recipient: [],
        institute: [],
        grant: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch popular searches based on the date range
    useEffect(() => {
        const fetchPopularSearches = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Format dates for API
                const fromDate = formatDate(dateRange.from)
                    .split("/")
                    .join("-");
                const toDate = formatDate(dateRange.to).split("/").join("-");

                // Fetch popular searches from API
                const response = await API.get(`/search/popular-searches`, {
                    params: {
                        from: fromDate,
                        to: toDate,
                    },
                });

                if (response.data) {
                    setPopularSearches(response.data);
                }
            } catch (err) {
                console.error("Error fetching popular searches:", err);
                setError("Failed to load popular searches. Please try again.");

                // Fallback to some mock data in case of error
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
            } finally {
                setIsLoading(false);
            }
        };

        fetchPopularSearches();
    }, [dateRange]);

    // Handle date range change
    const handleDateRangeChange = (newRange: { from: Date; to: Date }) => {
        setDateRange(newRange);
    };

    return (
        <Card className="p-4">
            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
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
                    </div>
                )}

                {/* Search Terms List */}
                {!isLoading && !error && (
                    <div className="space-y-2">
                        {popularSearches[activeCategory].length > 0 ? (
                            popularSearches[activeCategory].map(
                                (term, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            onSelect(activeCategory, term.text)
                                        }
                                        className="flex items-center justify-between w-full p-1 lg:p-2 hover:bg-gray-50 rounded-md transition-colors text-left"
                                    >
                                        <span className="text-gray-800 truncate flex-1">
                                            {term.text}
                                        </span>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                                            {term.count} searches
                                        </span>
                                    </button>
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
