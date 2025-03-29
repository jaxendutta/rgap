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
import { DEFAULT_FILTER_STATE, FILTER_LIMITS } from "@/constants/filters";
import Tag, { Tags } from "@/components/common/ui/Tag";
import { SearchHistory } from "@/types/models";
import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { useNavigate } from "react-router-dom";
import { useDeleteSearchHistory } from "@/hooks/api/useSearchHistory";
import { useNotification } from "@/components/features/notifications/NotificationProvider";

interface SearchHistoryCardProps {
    search: SearchHistory;
}

export const SearchHistoryCard = ({ search }: SearchHistoryCardProps) => {
    const { showNotification } = useNotification();

    // Get the search parameters
    const searchParams = search.search_params;

    // Extract search terms
    const searchTerms = [
        {
            key: "recipient",
            value: searchParams?.searchTerms.recipient,
            icon: GraduationCap,
        },
        {
            key: "grant",
            value: searchParams?.searchTerms.grant,
            icon: BookMarked,
        },
        {
            key: "institute",
            value: searchParams?.searchTerms.institute,
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
        const activeFilters = [];
        const filters = searchParams?.filters || {};

        // Guard against missing filter properties
        if (!filters) return [];

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
            // Check if the filter property exists
            if (!filters[filterType as keyof typeof filters]) return;

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

    const navigate = useNavigate();

    const handleRerunSearch = (searchParams: any) => {
        // Ensure searchParams has all required fields before navigation
        const validatedParams = {
            searchTerms: {
                recipient: searchParams?.searchTerms?.recipient || "",
                institute: searchParams?.searchTerms?.institute || "",
                grant: searchParams?.searchTerms?.grant || "",
            },
            filters: searchParams?.filters || DEFAULT_FILTER_STATE,
            sortConfig: searchParams?.sortConfig || {
                field: "date",
                direction: "desc",
            },
        };

        // Log the search params for debugging
        console.log("Rerunning search with params:", validatedParams);

        // Navigate to search page with validated params
        navigate("/search", { state: { searchParams: validatedParams } });
    };

    // Delete search history mutation
    const deleteSearchHistoryMutation = useDeleteSearchHistory();

    // Handle deletion of a search history entry
    const handleDeleteHistory = async (historyId: number) => {
        try {
            await deleteSearchHistoryMutation.mutateAsync(historyId);
            showNotification("History entry deleted successfully!", "success");
        } catch (error: any) {
            showNotification(
                error.message || "Failed to delete history entry",
                "error"
            );
        }
    };

    return (
        <Card className="p-4 flex justify-between flex-row hover:border-gray-200 transition-all duration-200">
            {/* Information */}
            <div className="flex flex-col gap-2">
                {/* Metadata - date, time and results count */}
                <Tags>
                    {[
                        { Icon: Calendar, text: `${formattedDate}` },
                        { Icon: Clock, text: formattedTime },
                        {
                            Icon: BookMarked,
                            text: `${search.result_count.toLocaleString()} results`,
                        },
                    ].map(({ Icon, text }, index) => (
                        <Tag
                            key={index}
                            variant={"outline"}
                            pill={true}
                            icon={Icon}
                            size="sm"
                        >
                            <span className="text-xs lg:text-sm">{text}</span>
                        </Tag>
                    ))}
                </Tags>

                {/* Search terms */}
                {hasSearchTerms && (
                    <Tags>
                        {searchTerms.map(({ key, value, icon: Icon }) => (
                            <Tag
                                key={key}
                                icon={Icon}
                                variant="primary"
                                size="md"
                                pill={true}
                            >
                                "{value}"
                            </Tag>
                        ))}
                    </Tags>
                )}

                {/* Active filters */}
                {hasFilters && (
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
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
                {/* Bookmark Button */}
                <BookmarkButton
                    entityId={search.history_id}
                    entityType="search"
                    isBookmarked={search.bookmarked}
                    size="sm"
                />

                {/* Run Search Button */}
                <Button
                    variant="secondary"
                    pill={true}
                    size="sm"
                    leftIcon={Search}
                    onClick={() => handleRerunSearch(searchParams)}
                >
                    <span className="hidden md:inline">Run Search</span>
                </Button>

                {/* Delete Button */}
                <Button
                    variant="outline"
                    pill={true}
                    size="sm"
                    leftIcon={Trash2}
                    onClick={() => handleDeleteHistory(search.history_id)}
                    className="text-red-600 hover:bg-red-50"
                >
                    <span className="hidden md:inline">Delete</span>
                </Button>
            </div>
        </Card>
    );
};
