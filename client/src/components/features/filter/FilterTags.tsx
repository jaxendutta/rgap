// src/components/features/filter/FilterTags.tsx
import { X } from "lucide-react";
import { formatDate, formatCurrency } from "@/utils/format";
import { FILTER_LIMITS, DEFAULT_FILTER_STATE } from "@/constants/filters";

type FilterKey =
    | "dateRange"
    | "valueRange"
    | "agencies"
    | "countries"
    | "provinces"
    | "cities";

interface FilterTagsProps {
    filters: typeof DEFAULT_FILTER_STATE;
    onRemove: (type: FilterKey, value: string) => void;
    onClearAll: () => void;
}

export const FilterTags = ({
    filters,
    onRemove,
    onClearAll,
}: FilterTagsProps) => {
    // Check if any filters are active
    const hasValueRangeFilter =
        filters.valueRange &&
        (filters.valueRange.min > FILTER_LIMITS.GRANT_VALUE.MIN ||
            filters.valueRange.max < FILTER_LIMITS.GRANT_VALUE.MAX);

    const hasDateRangeFilter =
        filters.dateRange &&
        (filters.dateRange.from > DEFAULT_FILTER_STATE.dateRange.from ||
            filters.dateRange.to < DEFAULT_FILTER_STATE.dateRange.to);

    const hasFilters =
        filters.agencies.length > 0 ||
        filters.countries.length > 0 ||
        filters.provinces.length > 0 ||
        filters.cities.length > 0 ||
        hasDateRangeFilter ||
        hasValueRangeFilter;

    if (!hasFilters) return null;

    return (
        <div className="py-3 border-b">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                    Active Filters
                </h3>
                <button
                    onClick={onClearAll}
                    className="text-sm text-blue-600 hover:text-blue-700"
                >
                    Clear all
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {hasDateRangeFilter && (
                    <FilterTag
                        filterKey="Dates"
                        filterValue={`${formatDate(
                            filters.dateRange.from
                        )} → ${formatDate(filters.dateRange.to)}`}
                        onRemove={() => onRemove("dateRange", "")}
                    />
                )}

                {hasValueRangeFilter && (
                    <FilterTag
                        filterKey="Value"
                        filterValue={`${formatCurrency(
                            filters.valueRange.min
                        )} - ${formatCurrency(filters.valueRange.max)}`}
                        onRemove={() => onRemove("valueRange", "")}
                    />
                )}

                {filters.agencies.map((agency) => (
                    <FilterTag
                        key={agency}
                        filterKey="Agency"
                        filterValue={agency}
                        onRemove={() => onRemove("agencies", agency)}
                    />
                ))}

                {filters.countries.map((country) => (
                    <FilterTag
                        key={country}
                        filterKey="Country"
                        filterValue={country}
                        onRemove={() => onRemove("countries", country)}
                    />
                ))}

                {filters.provinces.map((province) => (
                    <FilterTag
                        key={province}
                        filterKey="Province"
                        filterValue={province}
                        onRemove={() => onRemove("provinces", province)}
                    />
                ))}

                {filters.cities.map((city) => (
                    <FilterTag
                        key={city}
                        filterKey="City"
                        filterValue={city}
                        onRemove={() => onRemove("cities", city)}
                    />
                ))}
            </div>
        </div>
    );
};

interface FilterTagProps {
    filterKey: string;
    filterValue: string;
    onRemove: () => void;
}

const FilterTag = ({ filterKey, filterValue, onRemove }: FilterTagProps) => (
    <span className="inline-flex items-center px-2 py-1 text-sm bg-gray-100 rounded-md">
        <span className="font-medium">{filterKey}</span>
        <span className="text-gray-400 mx-1.5">|</span>
        {filterValue}
        <button
            onClick={onRemove}
            className="ml-1 p-0.5 hover:bg-gray-200 rounded"
        >
            <X className="w-3 h-3" />
        </button>
    </span>
);
