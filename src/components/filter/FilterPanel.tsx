// src/components/features/filter/FilterPanel.tsx
'use client';

import { DEFAULT_FILTER_STATE, FILTER_LIMITS } from '@/constants/filters';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { DateRangeFilter } from './DateRangeFilter';
import { ValueRangeFilter, type RangeValue } from './ValueRangeFilter';
import { LuEarth, LuLandmark, LuLocateFixed, LuRadar } from 'react-icons/lu';

interface FilterOptions {
    agencies: string[];
    countries: string[];
    provinces: string[];
    cities: string[];
}

interface FilterPanelProps {
    filters: typeof DEFAULT_FILTER_STATE;
    filterOptions: FilterOptions;
    onChange: (filters: typeof DEFAULT_FILTER_STATE) => void;
}

export function FilterPanel({ filters, filterOptions, onChange }: FilterPanelProps) {
    const handleDateRangeChange = (range: typeof DEFAULT_FILTER_STATE.dateRange) => {
        onChange({ ...filters, dateRange: range });
    };

    const handleValueRangeChange = (range: RangeValue) => {
        // Convert RangeValue (which can be number | Date) to our number-only format
        onChange({
            ...filters,
            valueRange: {
                min: typeof range.min === 'number' ? range.min : range.min.getTime(),
                max: typeof range.max === 'number' ? range.max : range.max.getTime(),
            }
        });
    };

    const handleMultiSelectChange = (
        field: 'agencies' | 'countries' | 'provinces' | 'cities',
        values: string[]
    ) => {
        onChange({ ...filters, [field]: values });
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                {/* Date Range */}
                <DateRangeFilter
                    label="Date Range"
                    value={filters.dateRange || FILTER_LIMITS.DATE_VALUE}
                    onChange={handleDateRangeChange}
                />

                {/* Value Range */}
                <ValueRangeFilter
                    label="Value Range"
                    type="currency"
                    value={{
                        min: filters.valueRange?.min ?? FILTER_LIMITS.GRANT_VALUE.MIN,
                        max: filters.valueRange?.max ?? FILTER_LIMITS.GRANT_VALUE.MAX,
                    }}
                    onChange={handleValueRangeChange}
                />

                {/* Agencies */}
                <MultiSelect
                    icon={LuLandmark}
                    label="Agencies"
                    options={filterOptions.agencies}
                    values={filters.agencies}
                    onChange={(values) => handleMultiSelectChange('agencies', values)}
                />

                {/* Countries */}
                <MultiSelect
                    icon={LuEarth}
                    label="Countries"
                    options={filterOptions.countries}
                    values={filters.countries}
                    onChange={(values) => handleMultiSelectChange('countries', values)}
                />

                {/* Provinces */}
                <MultiSelect
                    icon={LuRadar}
                    label="Provinces"
                    options={filterOptions.provinces}
                    values={filters.provinces}
                    onChange={(values) => handleMultiSelectChange('provinces', values)}
                />

                {/* Cities */}
                <MultiSelect
                    icon={LuLocateFixed}
                    label="Cities"
                    options={filterOptions.cities}
                    values={filters.cities}
                    onChange={(values) => handleMultiSelectChange('cities', values)}
                />
            </div>
        </>
    );
}
