// src/components/features/account/SearchHistoryCard.tsx
import {
    Search,
    BookMarked,
    GraduationCap,
    University,
    Calendar,
    Clock,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/common/ui/Button";
import { Card } from "@/components/common/ui/Card";
import { formatCurrency } from "@/utils/format";
import { FILTER_LIMITS } from "@/constants/filters";
import Tag, { Tags } from "@/components/common/ui/Tag";
import { SearchHistory } from "@/types/models";
import { GrantSearchParams } from "@/types/search";
import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";

interface SearchHistoryCardProps {
    search: SearchHistory;
    onRerun: (params: GrantSearchParams) => void;
    onDelete: (historyId: number) => void;
}

export const SearchHistoryCard = ({
    search,
    onRerun,
    onDelete,
}: SearchHistoryCardProps) => {
    // Get the search parameters
    const searchParams = search.search_params;

    // Extract search terms
    const searchTerms = [
        {
            key: "recipient",
            value: searchParams.searchTerms.recipient,
            icon: GraduationCap,
        },
        {
            key: "grant",
            value: searchParams.searchTerms.grant,
            icon: BookMarked,
        },
        {
            key: "institute",
            value: searchParams.searchTerms.institute,
            icon: University,
        },
    ].filter(
        (item) =>
            item.value &&
            typeof item.value === "string" &&
            item.value.trim() !== ""
    );

    // Helper function to get active filters
    const getActiveFilters = () => {
        const activeFilters: Array<{
            type: string;
            label: string;
            value: string;
        }> = [];
        const filters = searchParams.filters;

        // Date range filter
        if (
            filters.dateRange &&
            ((filters.dateRange.from !== undefined &&
                filters.dateRange.from > FILTER_LIMITS.DATE_VALUE.MIN) ||
                (filters.dateRange.to !== undefined &&
                    filters.dateRange.to < FILTER_LIMITS.DATE_VALUE.MAX))
        ) {
            activeFilters.push({
                type: "dateRange",
                label: "Date Range",
                value: `${new Date(
                    filters.dateRange.from
                ).toLocaleDateString()} - ${new Date(
                    filters.dateRange.to
                ).toLocaleDateString()}`,
            });
        }

        // Value range filter
        if (
            filters.valueRange &&
            ((filters.valueRange.min !== undefined &&
                filters.valueRange.min > 0) ||
                (filters.valueRange.max !== undefined &&
                    filters.valueRange.max < FILTER_LIMITS.GRANT_VALUE.MAX))
        ) {
            activeFilters.push({
                type: "valueRange",
                label: "Value",
                value: `${formatCurrency(
                    filters.valueRange.min || 0
                )} - ${formatCurrency(
                    filters.valueRange.max || FILTER_LIMITS.GRANT_VALUE.MAX
                )}`,
            });
        }

        // Array filters (agencies, countries, provinces, cities)
        const arrayFilters = ["agencies", "countries", "provinces", "cities"];
        arrayFilters.forEach((filterType) => {
            const values = filters[
                filterType as keyof typeof filters
            ] as string[];
            if (Array.isArray(values) && values.length > 0) {
                activeFilters.push({
                    type: filterType,
                    label:
                        filterType.charAt(0).toUpperCase() +
                        filterType.slice(1),
                    value: values.join(", "),
                });
            }
        });

        return activeFilters;
    };

    const activeFilters = getActiveFilters();

    // Format timestamp
    const timestamp = new Date(search.search_time);
    const formattedDate = timestamp.toLocaleDateString();
    const formattedTime = timestamp.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    const hasSearchTerms = searchTerms.length > 0;
    const hasFilters = activeFilters.length > 0;
    const hasContent = hasSearchTerms || hasFilters;

    return (
        <Card className="p-4 hover:border-gray-200 transition-all duration-200">
            {/* Responsive layout - switches to two columns on larger screens */}
            <div className="flex flex-col lg:flex-row lg:justify-between gap-3">
                {/* Left column - Search terms and filters */}
                <div className="flex-1">
                    {/* Search terms */}
                    {hasSearchTerms && (
                        <div className="mb-2">
                            <Tags>
                                {searchTerms.map(
                                    ({ key, value, icon: Icon }) => (
                                        <Tag
                                            key={key}
                                            icon={Icon}
                                            variant="primary"
                                            size="md"
                                        >
                                            "{value}"
                                        </Tag>
                                    )
                                )}
                            </Tags>
                        </div>
                    )}

                    {/* Active filters */}
                    {hasFilters && (
                        <div>
                            <Tags spacing="tight">
                                {activeFilters.map((filter, index) => (
                                    <Tag
                                        key={`filter-${index}`}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <span className="font-medium">
                                            {filter.label}:
                                        </span>{" "}
                                        {filter.value}
                                    </Tag>
                                ))}
                            </Tags>
                        </div>
                    )}

                    {/* Message when no search terms or filters */}
                    {!hasContent && (
                        <div className="text-sm text-gray-500 italic">
                            Basic search without specific terms or filters
                        </div>
                    )}
                </div>

                {/* Right column - Metadata and actions */}
                <div className="flex flex-col space-y-2">
                    {/* Metadata row - date, time and results count */}
                    <div className="flex justify-between items-center lg:justify-end lg:gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formattedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <BookMarked className="h-3.5 w-3.5" />
                            <span>
                                {search.result_count.toLocaleString()} results
                            </span>
                        </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex gap-2 items-center justify-end">
                        {/* Bookmark Button */}
                        <BookmarkButton
                            entityId={search.history_id}
                            entityType="search"
                            isBookmarked={search.bookmarked}
                            size="sm"
                            variant="icon"
                        />

                        {/* Run Search Button */}
                        <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={Search}
                            onClick={() => onRerun(searchParams)}
                        >
                            <span className="hidden md:inline">Run Search</span>
                        </Button>

                        {/* Delete Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={Trash2}
                            onClick={() => onDelete(search.history_id)}
                            className="text-red-600 hover:bg-red-50"
                        >
                            <span className="hidden md:inline">Delete</span>
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};
