// src/components/features/grants/FilterPanel.tsx
import { FILTER_LIMITS } from "@/constants/filters";
import { MultiSelect } from "@/components/common/ui/MultiSelect";
import { RangeFilter } from "@/components/common/ui/RangeFilter";
import { useFilterOptions } from "@/hooks/api/useFilterOptions";
import type { GrantSearchParams } from "@/types/search";
import { LoadingSpinner } from "@/components/common/ui/LoadingSpinner";

interface FilterPanelProps {
    filters: {
        yearRange: { start: number; end: number };
        valueRange: { min: number; max: number };
        agencies: string[];
        countries: string[];
        provinces: string[];
        cities: string[];
    };
    onChange: (filters: {
        yearRange: { start: number; end: number };
        valueRange: { min: number; max: number };
        agencies: string[];
        countries: string[];
        provinces: string[];
        cities: string[];
    }) => void;
}

export const FilterPanel = ({ filters, onChange }: FilterPanelProps) => {
    const { data: filterOptions, isLoading, error } = useFilterOptions();

    const handleRangeChange = (
        type: "yearRange" | "valueRange",
        range: { min: number; max: number }
    ) => {
        if (type === "yearRange") {
            onChange({
                ...filters,
                yearRange: {
                    start: range.min,
                    end: range.max,
                },
            });
        } else {
            onChange({
                ...filters,
                valueRange: range,
            });
        }
    };

    const handleMultiSelectChange = (
        field: keyof Pick<
            GrantSearchParams["filters"],
            "agencies" | "countries" | "provinces" | "cities"
        >,
        values: string[]
    ) => {
        onChange({
            ...filters,
            [field]: values,
        });
    };

    if (error) {
        return (
            <div className="text-red-600 p-4 rounded-lg bg-red-50">
                Failed to load filter options. Please try again later.
            </div>
        );
    }

    return (
        <div>
            <div className="text-xl font-medium mb-4">Filters</div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <RangeFilter
                    label="Year"
                    type="year"
                    value={{
                        min:
                            Number(filters.yearRange?.start) ||
                            FILTER_LIMITS.YEAR.MIN,
                        max:
                            Number(filters.yearRange?.end) ||
                            FILTER_LIMITS.YEAR.MAX,
                    }}
                    onChange={(range) => handleRangeChange("yearRange", range)}
                />

                <RangeFilter
                    label="Value"
                    type="currency"
                    value={
                        filters.valueRange || {
                            min: FILTER_LIMITS.GRANT_VALUE.MIN,
                            max: FILTER_LIMITS.GRANT_VALUE.MAX,
                        }
                    }
                    onChange={(range) => handleRangeChange("valueRange", range)}
                />

                {isLoading ? (
                    <div className="col-span-full flex justify-center items-center py-4">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    filterOptions && (
                        <>
                            <MultiSelect
                                label="Agencies"
                                options={filterOptions.agencies || []}
                                values={filters.agencies || []}
                                onChange={(values) =>
                                    handleMultiSelectChange("agencies", values)
                                }
                            />

                            <MultiSelect
                                label="Countries"
                                options={filterOptions.countries || []}
                                values={filters.countries || []}
                                onChange={(values) =>
                                    handleMultiSelectChange("countries", values)
                                }
                            />

                            <MultiSelect
                                label="Provinces"
                                options={filterOptions.provinces || []}
                                values={filters.provinces || []}
                                onChange={(values) =>
                                    handleMultiSelectChange("provinces", values)
                                }
                            />

                            <MultiSelect
                                label="Cities"
                                options={filterOptions.cities || []}
                                values={filters.cities || []}
                                onChange={(values) =>
                                    handleMultiSelectChange("cities", values)
                                }
                            />
                        </>
                    )
                )}
            </div>
        </div>
    );
};
