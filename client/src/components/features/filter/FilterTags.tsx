// src/components/features/filter/FilterTags.tsx
import React from "react";
import { X, LucideIcon } from "lucide-react";
import { formatDate, formatCurrency } from "@/utils/format";
import { FILTER_LIMITS, DEFAULT_FILTER_STATE } from "@/constants/filters";
import { cn } from "@/utils/cn";

type FilterKey =
    | "dateRange"
    | "valueRange"
    | "agencies"
    | "countries"
    | "provinces"
    | "cities";

// FilterTag Component
export interface FilterTagProps {
    icon?: LucideIcon;
    label: string;
    value: string | string[];
    className?: string;
    size?: "sm" | "md";
    onRemove?: () => void;
}

export const FilterTag: React.FC<FilterTagProps> = ({
    icon: Icon,
    label,
    value,
    className,
    size = "md",
    onRemove,
}) => {
    const sizes = {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1.5 text-sm",
    };

    const iconSizes = {
        sm: "h-3 w-3",
        md: "h-4 w-4",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-md bg-gray-100 text-gray-700 gap-1.5",
                sizes[size],
                className
            )}
        >
            {Icon && <Icon className={iconSizes[size]} />}
            {label && <span className="font-medium">{label}:</span>}
            <span className="truncate">
                {Array.isArray(value) ? value.join(", ") : value}
            </span>
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-1 p-0.5 hover:bg-gray-200 rounded"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </span>
    );
};

// FilterTags Component
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
                    <SimpleFilterTag
                        filterKey="Dates"
                        filterValue={`${formatDate(
                            filters.dateRange.from
                        )} → ${formatDate(filters.dateRange.to)}`}
                        onRemove={() => onRemove("dateRange", "")}
                    />
                )}

                {hasValueRangeFilter && (
                    <SimpleFilterTag
                        filterKey="Value"
                        filterValue={`${formatCurrency(
                            filters.valueRange.min
                        )} - ${formatCurrency(filters.valueRange.max)}`}
                        onRemove={() => onRemove("valueRange", "")}
                    />
                )}

                {filters.agencies.map((agency) => (
                    <SimpleFilterTag
                        key={agency}
                        filterKey="Agency"
                        filterValue={agency}
                        onRemove={() => onRemove("agencies", agency)}
                    />
                ))}

                {filters.countries.map((country) => (
                    <SimpleFilterTag
                        key={country}
                        filterKey="Country"
                        filterValue={country}
                        onRemove={() => onRemove("countries", country)}
                    />
                ))}

                {filters.provinces.map((province) => (
                    <SimpleFilterTag
                        key={province}
                        filterKey="Province"
                        filterValue={province}
                        onRemove={() => onRemove("provinces", province)}
                    />
                ))}

                {filters.cities.map((city) => (
                    <SimpleFilterTag
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

interface SimpleFilterTagProps {
    filterKey: string;
    filterValue: string;
    onRemove: () => void;
}

const SimpleFilterTag = ({
    filterKey,
    filterValue,
    onRemove,
}: SimpleFilterTagProps) => (
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

export default FilterTags;
