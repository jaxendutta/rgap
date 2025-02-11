// src/components/features/grants/FilterPanel.tsx
import { FILTER_LIMITS } from '@/constants/filters'
import { MultiSelect } from '@/components/common/ui/MultiSelect'
import { RangeFilter } from '@/components/common/ui/RangeFilter'
import { useFilterOptions } from '@/hooks/api/useFilterOptions'
import type { GrantSearchParams } from '@/services/api/grants'

interface FilterPanelProps {
  filters: {
    yearRange: { start: number; end: number };
    valueRange: { min: number; max: number };
    agencies: string[];
    countries: string[];
    provinces: string[];
    cities: string[];
  }
  onChange: (filters: {
    yearRange: { start: number; end: number };
    valueRange: { min: number; max: number };
    agencies: string[];
    countries: string[];
    provinces: string[];
    cities: string[];
  }) => void
}

export const FilterPanel = ({ filters, onChange }: FilterPanelProps) => {
  const { data: filterOptions, isLoading } = useFilterOptions()

  const handleRangeChange = (type: 'yearRange' | 'valueRange', range: { min: number; max: number }) => {
    if (type === 'yearRange') {
      onChange({
        ...filters,
        yearRange: {
          start: range.min,
          end: range.max
        }
      })
    } else {
      onChange({
        ...filters,
        valueRange: range
      })
    }
  }

  const handleMultiSelectChange = (
    field: keyof Pick<GrantSearchParams['filters'], 'agencies' | 'countries' | 'provinces' | 'cities'>,
    values: string[]
  ) => {
    onChange({
      ...filters,
      [field]: values
    })
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading filters...</div>
  }

  return (
    <div>
      <div className="text-xl font-semibold mb-4">Filters</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <RangeFilter
        label="Year"
        type="year"
        value={{
        min: Number(filters.yearRange?.start) || FILTER_LIMITS.YEAR.MIN,
        max: Number(filters.yearRange?.end) || FILTER_LIMITS.YEAR.MAX
        }}
        onChange={(range) => handleRangeChange('yearRange', range)}
      />

      <RangeFilter
        label="Value"
        type="currency"
        value={filters.valueRange || { min: FILTER_LIMITS.GRANT_VALUE.MIN, max: FILTER_LIMITS.GRANT_VALUE.MAX }}
        onChange={(range) => handleRangeChange('valueRange', range)}
      />

      {filterOptions && (
        <>
        <MultiSelect
          label="Funding Agencies"
          options={filterOptions.agencies || []}
          values={filters.agencies || []}
          onChange={(values) => handleMultiSelectChange('agencies', values)}
        />

        <MultiSelect
          label="Countries"
          options={filterOptions.countries || []}
          values={filters.countries || []}
          onChange={(values) => handleMultiSelectChange('countries', values)}
        />

        <MultiSelect
          label="Provinces"
          options={filterOptions.provinces || []}
          values={filters.provinces || []}
          onChange={(values) => handleMultiSelectChange('provinces', values)}
        />

        <MultiSelect
          label="Cities"
          options={filterOptions.cities || []}
          values={filters.cities || []}
          onChange={(values) => handleMultiSelectChange('cities', values)}
        />
        </>
      )}
      </div>
    </div>
  )
}