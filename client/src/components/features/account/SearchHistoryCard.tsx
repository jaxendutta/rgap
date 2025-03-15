// src/components/features/account/SearchHistoryCard.tsx
import {
    Search,
    Calendar,
    DollarSign,
    Filter,
    BookMarked,
    GraduationCap,
    University,
} from "lucide-react";
import { Button } from "@/components/common/ui/Button";
import { Card } from "@/components/common/ui/Card";
import { FilterTag } from "@/components/features/filter/FilterTag";
import { formatCurrency } from "@/utils/format";
import type { GrantSearchParams } from "@/types/search";
import { FILTER_LIMITS, DEFAULT_FILTER_STATE } from "@/constants/filters";
import type { SearchHistory } from "@/types/models";

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
  // Extract search terms from the search_params object, filtering out empty values
  const searchTerms = Object.entries(search.search_params.searchTerms)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({
      key,
      value,
      icon:
        key === 'recipient'
          ? GraduationCap
          : key === 'institute'
          ? University
          : BookMarked,
    }));

    // Filter out empty filter values
    const activeFilters = Object.entries(search.search_params.filters).filter(
        ([_, value]) => {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === "object" && value !== null) {
                if ("from" in value && "to" in value) {
                    return value.from !== null || value.to !== null;
                }
                if ("min" in value && "max" in value) {
                    return (
                        value.min > FILTER_LIMITS.GRANT_VALUE.MIN ||
                        value.max < FILTER_LIMITS.GRANT_VALUE.MAX
                    );
                }
            }
            return false;
        }
    );

    return (
        <Card className="p-4 space-y-3">
            {/* Header: Time and Results */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>
                        {new Date(search.timestamp).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>
                        {new Date(search.timestamp).toLocaleTimeString()}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <BookMarked className="h-4 w-4" />
                    <span>{search.results} results</span>
                </div>
            </div>

            {/* Search Terms */}
            {searchTerms.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {searchTerms.map(({ key, value, icon: Icon }) => (
                        <div
                            key={key}
                            className="flex items-center gap-2 text-sm"
                        >
                            <Icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
                            <span className="text-gray-900">{value}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Active Filters */}
            {activeFilters.map(([key, value]) => {
                if (
                    key === "dateRange" &&
                    typeof value === "object" &&
                    value !== null
                ) {
                    const { from, to } = value as typeof DEFAULT_FILTER_STATE.dateRange;
                    if (from || to) {
                        const formatDate = (date: Date) => {
                            if (!date) return "Any";
                            return new Date(date).toLocaleDateString();
                        };

                        return (
                            <FilterTag
                                key={key}
                                icon={Calendar}
                                label="Date Range"
                                value={`${formatDate(from)} - ${formatDate(
                                    to
                                )}`}
                                size="sm"
                            />
                        );
                    }
                }
                if (
                    key === "valueRange" &&
                    typeof value === "object" &&
                    value !== null
                ) {
                    const { min, max } = value as { min: number; max: number };
                    if (
                        min > FILTER_LIMITS.GRANT_VALUE.MIN ||
                        max < FILTER_LIMITS.GRANT_VALUE.MAX
                    ) {
                        return (
                            <FilterTag
                                key={key}
                                icon={DollarSign}
                                label="Values"
                                value={`${formatCurrency(
                                    min
                                )} - ${formatCurrency(max)}`}
                                size="sm"
                            />
                        );
                    }
                }
                if (Array.isArray(value) && value.length > 0) {
                    return (
                        <FilterTag
                            key={key}
                            icon={Filter}
                            label={key}
                            value={value.join(", ")}
                            size="sm"
                        />
                    );
                }
                return null;
            })}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onRerun(search.search_params)}>
          Run Search
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(search.history_id)}>
          Delete
        </Button>
      </div>
    </Card>
  );
};
