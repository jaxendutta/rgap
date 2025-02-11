// src/components/common/ui/FilterTags.tsx
import { X } from 'lucide-react'
import { GrantSearchParams } from '@/services/api/grants'
import { formatCurrency } from '@/utils/format'
import { FILTER_LIMITS } from '@/constants/filters'

interface FilterTagsProps {
  filters: GrantSearchParams['filters']
  onRemove: (type: keyof GrantSearchParams['filters'], value: string) => void
  onClearAll: () => void
}

export const FilterTags = ({ filters, onRemove, onClearAll }: FilterTagsProps) => {
  // Check if any filters are active
  const hasValueRangeFilter = filters.valueRange && ((filters.valueRange.min > FILTER_LIMITS.GRANT_VALUE.MIN) || (filters.valueRange.max < FILTER_LIMITS.GRANT_VALUE.MAX))
  const hasYearRangeFilter = filters.yearRange && ((filters.yearRange.start > FILTER_LIMITS.YEAR.MIN) || (filters.yearRange.end < FILTER_LIMITS.YEAR.MAX))
  const hasFilters = filters.agencies.length > 0 || 
    filters.countries.length > 0 || 
    filters.provinces.length > 0 || 
    filters.cities.length > 0 ||
    hasYearRangeFilter ||
    hasValueRangeFilter

  if (!hasFilters) return null

  return (
    <div className="py-3 border-b">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Active Filters</h3>
        <button
          onClick={onClearAll}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {hasYearRangeFilter && (
          <FilterTag
            label={`Years: ${filters.yearRange.start}-${filters.yearRange.end}`}
            onRemove={() => onRemove('yearRange', '')}
          />
        )}

        {hasValueRangeFilter && (
          <FilterTag
            label={`Value: ${formatCurrency(filters.valueRange.min)} - ${formatCurrency(filters.valueRange.max)}`}
            onRemove={() => onRemove('valueRange', '')}
          />
        )}

        {filters.agencies.map(agency => (
          <FilterTag
            key={agency}
            label={`Agency: ${agency}`}
            onRemove={() => onRemove('agencies', agency)}
          />
        ))}

        {filters.countries.map(country => (
          <FilterTag
            key={country}
            label={`Country: ${country}`}
            onRemove={() => onRemove('countries', country)}
          />
        ))}

        {filters.provinces.map(province => (
          <FilterTag
            key={province}
            label={`Province: ${province}`}
            onRemove={() => onRemove('provinces', province)}
          />
        ))}

        {filters.cities.map(city => (
          <FilterTag
            key={city}
            label={`City: ${city}`}
            onRemove={() => onRemove('cities', city)}
          />
        ))}
      </div>
    </div>
  )
}

interface FilterTagProps {
  label: string
  onRemove: () => void
}

const FilterTag = ({ label, onRemove }: FilterTagProps) => (
  <span className="inline-flex items-center px-2 py-1 text-sm bg-gray-100 rounded-md">
    {label}
    <button
      onClick={onRemove}
      className="ml-1 p-0.5 hover:bg-gray-200 rounded"
    >
      <X className="w-3 h-3" />
    </button>
  </span>
)