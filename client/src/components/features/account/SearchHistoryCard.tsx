// src/components/features/account/SearchHistoryCard.tsx
import {
    Search,
    BookMarked,
    GraduationCap,
    University,
} from "lucide-react";
import { Button } from "@/components/common/ui/Button";
import { Card } from "@/components/common/ui/Card";
import { formatCurrency } from "@/utils/format";
import { FILTER_LIMITS } from "@/constants/filters";
import { GrantSearchParams } from "@/types/search";
import Tag from "@/components/common/ui/Tag";

interface SearchHistoryCardProps {
    search: {
        history_id: number;
        search_recipient?: string;
        search_grant?: string;
        search_institution?: string;
        search_filters?: string | any;
        search_time: string;
        result_count: number;
        saved: boolean;
    };
    onRerun: (params: any) => void;
    onDelete: (historyId: number) => void;
}

export const SearchHistoryCard = ({
    search,
    onRerun,
    onDelete,
}: SearchHistoryCardProps) => {
    console.log("Search history item:", search); // For debugging

    // Extract search terms from individual fields
    const searchTerms = [
        {
            key: "recipient",
            value: search.search_recipient,
            icon: GraduationCap,
        },
        { key: "grant", value: search.search_grant, icon: BookMarked },
        {
            key: "institute",
            value: search.search_institution,
            icon: University,
        },
    ].filter((item) => item.value && item.value.trim() !== "");

    // Parse search filters from JSON if needed
    let filters: any = {};
    try {
        if (typeof search.search_filters === "string") {
            filters = JSON.parse(search.search_filters);
        } else if (search.search_filters) {
            filters = search.search_filters;
        }
    } catch (e) {
        console.error("Error parsing search filters:", e);
    }

    // Format date for display
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime())
                ? "Any date"
                : date.toLocaleDateString();
        } catch {
            return "Any date";
        }
    };

    // Helper function to get active filters
    const getActiveFilters = () => {
        const activeFilters = [];

        // Date range filter
        if (filters.dateRange) {
            const { from, to } = filters.dateRange;
            if (from || to) {
                activeFilters.push({
                    type: "dateRange",
                    label: "Date Range",
                    value: `${formatDate(from)} - ${formatDate(to)}`,
                });
            }
        }

        // Value range filter
        if (filters.valueRange) {
            const { min, max } = filters.valueRange;
            if (
                (min !== undefined && min > 0) ||
                (max !== undefined && max < FILTER_LIMITS.GRANT_VALUE.MAX)
            ) {
                activeFilters.push({
                    type: "valueRange",
                    label: "Value",
                    value: `${formatCurrency(min || 0)} - ${formatCurrency(
                        max || FILTER_LIMITS.GRANT_VALUE.MAX
                    )}`,
                });
            }
        }

        // Array filters (agencies, countries, provinces, cities)
        const arrayFilters = ["agencies", "countries", "provinces", "cities"];
        arrayFilters.forEach((filterType) => {
            const values = filters[filterType];
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
    const timestamp = search.search_time;

    // Create search params object for rerunning the search
    const searchParams: GrantSearchParams = {
        searchTerms: {
            recipient: search.search_recipient || "",
            grant: search.search_grant || "",
            institute: search.search_institution || "",
        },
        filters: filters,
        sortConfig: { field: "date", direction: "desc" },
    };

    return (
        <Card className="p-4 space-y-3">
            {/* Header: Time and Results */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>{formatDate(timestamp)}</span>
                    <span>•</span>
                    <span>{new Date(timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2">
                    <BookMarked className="h-4 w-4" />
                    <span>{search.result_count} results</span>
                </div>
            </div>

            {/* Search Terms */}
            {searchTerms.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {searchTerms.map(({ key, value, icon }) => (
                        <Tag key={key} icon={icon} variant="outline">
                            {value}
                        </Tag>
                    ))}
                </div>
            )}

            {/* Active Filters */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter, index) => (
                        <Tag key={`filter-${index}`}>
                            {filter.label}: {filter.value}
                        </Tag>
                    ))}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRerun(searchParams)}
                >
                    Run Search
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(search.history_id)}
                >
                    Delete
                </Button>
            </div>
        </Card>
    );
};
