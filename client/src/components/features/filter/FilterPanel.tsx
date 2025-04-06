// src/components/features/filter/FilterPanel.tsx
import { DEFAULT_FILTER_STATE, FILTER_LIMITS } from "@/constants/filters";
import { MultiSelect } from "@/components/common/ui/MultiSelect";
import type { RangeValue } from "@/components/features/filter/ValueRangeFilter";
import { ValueRangeFilter } from "@/components/features/filter/ValueRangeFilter";
import { DateRangeFilter } from "@/components/features/filter/DateRangeFilter";
import { useFilterOptions } from "@/hooks/api/useFilterOptions";
import { LoadingSpinner } from "@/components/common/ui/LoadingSpinner";
import { Earth, Landmark, LocateFixed, Radar } from "lucide-react";
import { Card } from "@/components/common/ui/Card";

interface FilterPanelProps {
    filters: typeof DEFAULT_FILTER_STATE;
    onChange: (filters: typeof DEFAULT_FILTER_STATE) => void;
}

export const FilterPanel = ({ filters, onChange }: FilterPanelProps) => {
    const { data: filterOptions, isLoading, error } = useFilterOptions();

    const handleDateRangeChange = (
        range: typeof DEFAULT_FILTER_STATE.dateRange
    ) => {
        onChange({
            ...filters,
            dateRange: range,
        });
    };

    const handleValueRangeChange = (range: RangeValue) => {
        onChange({
            ...filters,
            valueRange: {
                min:
                    typeof range.min === "number"
                        ? range.min
                        : range.min.getTime(),
                max:
                    typeof range.max === "number"
                        ? range.max
                        : range.max.getTime(),
            },
        });
    };

    const handleMultiSelectChange = (
        field: keyof Pick<
            typeof filters,
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
        <Card>
            <Card.Content>
                <div className="text-xl font-medium mb-4">Filters</div>
                {isLoading ? (
                    <div className="flex justify-center items-center py-4">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    filterOptions && (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* All 6 filters in one grid */}
                            <div className="col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-1">
                                <DateRangeFilter
                                    label={"Date Range"}
                                    value={
                                        filters.dateRange ||
                                        FILTER_LIMITS.DATE_VALUE
                                    }
                                    onChange={handleDateRangeChange}
                                />
                            </div>

                            <div className="col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-1">
                                <ValueRangeFilter
                                    label="Value"
                                    type="currency"
                                    value={
                                        filters.valueRange ||
                                        FILTER_LIMITS.GRANT_VALUE
                                    }
                                    onChange={handleValueRangeChange}
                                />
                            </div>

                            <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1">
                                <MultiSelect
                                    icon={Landmark}
                                    label="Agencies"
                                    options={filterOptions.agencies || []}
                                    values={filters.agencies || []}
                                    onChange={(values) =>
                                        handleMultiSelectChange(
                                            "agencies",
                                            values
                                        )
                                    }
                                />
                            </div>

                            <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1">
                                <MultiSelect
                                    icon={Earth}
                                    label="Countries"
                                    options={filterOptions.countries || []}
                                    values={filters.countries || []}
                                    onChange={(values) =>
                                        handleMultiSelectChange(
                                            "countries",
                                            values
                                        )
                                    }
                                />
                            </div>

                            <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1">
                                <MultiSelect
                                    label="Provinces"
                                    icon={Radar}
                                    options={filterOptions.provinces || []}
                                    values={filters.provinces || []}
                                    onChange={(values) =>
                                        handleMultiSelectChange(
                                            "provinces",
                                            values
                                        )
                                    }
                                />
                            </div>

                            <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1">
                                <MultiSelect
                                    label="Cities"
                                    icon={LocateFixed}
                                    options={filterOptions.cities || []}
                                    values={filters.cities || []}
                                    onChange={(values) =>
                                        handleMultiSelectChange(
                                            "cities",
                                            values
                                        )
                                    }
                                />
                            </div>
                        </div>
                    )
                )}
            </Card.Content>
        </Card>
    );
};
