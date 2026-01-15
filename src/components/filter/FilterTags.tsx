// src/components/filter/FilterTags.tsx
import React from "react";
import { LuX } from "react-icons/lu";
import { formatDate, formatCurrency } from "@/lib/format";
import { FILTER_LIMITS, DEFAULT_FILTER_STATE } from "@/constants/filters";
import { cn } from "@/lib/utils";

type FilterKey =
    | "dateRange"
    | "valueRange"
    | "agencies"
    | "countries"
    | "provinces"
    | "cities";

export interface FilterTagsProps {
    filters: typeof DEFAULT_FILTER_STATE;
    onRemove: (type: FilterKey, value: string) => void;
    onClearAll: () => void;
}

export const FilterTags: React.FC<FilterTagsProps> = ({
    filters,
    onRemove,
    onClearAll,
}) => {
    // Check if value range differs from default
    const hasValueRangeFilter =
        filters.valueRange &&
        (filters.valueRange.min > FILTER_LIMITS.GRANT_VALUE.MIN ||
            filters.valueRange.max < FILTER_LIMITS.GRANT_VALUE.MAX);

    // Check if date range differs from default
    // Using .getTime() ensures safe numeric comparison
    const hasDateRangeFilter =
        filters.dateRange &&
        (filters.dateRange.from.getTime() > DEFAULT_FILTER_STATE.dateRange.from.getTime() ||
            filters.dateRange.to.getTime() < DEFAULT_FILTER_STATE.dateRange.to.getTime());

    const hasFilters =
        filters.agencies.length > 0 ||
        filters.countries.length > 0 ||
        filters.provinces.length > 0 ||
        filters.cities.length > 0 ||
        hasDateRangeFilter ||
        hasValueRangeFilter;

    if (!hasFilters) return null;

    return (
        <div className="flex flex-col gap-3 py-4 border-b border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                    Active Filters
                </h3>
                <button
                    onClick={onClearAll}
                    className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    Clear all
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {hasDateRangeFilter && (
                    <FilterPill
                        label="Dates"
                        value={`${formatDate(filters.dateRange.from)} - ${formatDate(filters.dateRange.to)}`}
                        onRemove={() => onRemove("dateRange", "")}
                    />
                )}

                {hasValueRangeFilter && (
                    <FilterPill
                        label="Value"
                        value={`${formatCurrency(filters.valueRange.min)} - ${formatCurrency(filters.valueRange.max)}`}
                        onRemove={() => onRemove("valueRange", "")}
                    />
                )}

                {filters.agencies.map((agency) => (
                    <FilterPill
                        key={agency}
                        label="Agency"
                        value={agency}
                        onRemove={() => onRemove("agencies", agency)}
                    />
                ))}

                {filters.countries.map((country) => (
                    <FilterPill
                        key={country}
                        label="Country"
                        value={country}
                        onRemove={() => onRemove("countries", country)}
                    />
                ))}

                {filters.provinces.map((province) => (
                    <FilterPill
                        key={province}
                        label="Province"
                        value={province}
                        onRemove={() => onRemove("provinces", province)}
                    />
                ))}

                {filters.cities.map((city) => (
                    <FilterPill
                        key={city}
                        label="City"
                        value={city}
                        onRemove={() => onRemove("cities", city)}
                    />
                ))}
            </div>
        </div>
    );
};

interface FilterPillProps {
    label: string;
    value: string;
    onRemove: () => void;
    className?: string;
}

const FilterPill = ({ label, value, onRemove, className }: FilterPillProps) => (
    <span
        className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
            "bg-gray-50 border border-gray-200",
            "text-xs font-medium text-gray-700",
            "transition-all hover:bg-gray-100",
            className
        )}
    >
        <span className="text-gray-500">{label}:</span>
        <span className="text-gray-900">{value}</span>
        <button
            onClick={onRemove}
            className="ml-0.5 p-0.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 focus:outline-none transition-colors"
            aria-label={`Remove ${label} filter`}
        >
            <LuX className="w-3 h-3" />
        </button>
    </span>
);

export default FilterTags;
