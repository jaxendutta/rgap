// src/components/features/account/SearchHistoryCard.tsx
import { Search, Calendar, DollarSign, Filter, FileText, GraduationCap, University } from 'lucide-react'
import { Button } from '@/components/common/ui/Button'
import { Card } from '@/components/common/ui/Card'
import { FilterTag } from '@/components/common/ui/FilterTag'
import { formatCurrency } from '@/utils/format'
import type { GrantSearchParams } from '@/types/search'
import { FILTER_LIMITS } from '@/constants/filters'

interface SearchHistory {
  id: number
  timestamp: Date
  search_params: GrantSearchParams
  results: number
}

interface SearchHistoryCardProps {
  search: SearchHistory
  onRerun: (params: GrantSearchParams) => void
}

export const SearchHistoryCard = ({ search, onRerun }: SearchHistoryCardProps) => {
  // Filter out empty search terms
  const searchTerms = Object.entries(search.search_params.searchTerms)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({
      key,
      value,
      icon: key === 'recipient' 
        ? GraduationCap 
        : key === 'institute' 
          ? University 
          : FileText
    }))

  // Filter out empty filter values
  const activeFilters = Object.entries(search.search_params.filters)
    .filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object' && value !== null) {
        if ('start' in value && 'end' in value) {
          return value.start > FILTER_LIMITS.YEAR.MIN || value.end < FILTER_LIMITS.YEAR.MAX
        }
        if ('min' in value && 'max' in value) {
          return value.min > FILTER_LIMITS.GRANT_VALUE.MIN || value.max < FILTER_LIMITS.GRANT_VALUE.MAX
        }
      }
      return false
    })

  return (
    <Card className="p-4 space-y-3">
      {/* Header: Time and Results */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span>{new Date(search.timestamp).toLocaleDateString()}</span>
          <span>•</span>
          <span>{new Date(search.timestamp).toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>{search.results} results</span>
        </div>
      </div>

      {/* Search Terms */}
      {searchTerms.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {searchTerms.map(({ key, value, icon: Icon }) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <Icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
              <span className="text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeFilters.map(([key, value]) => {
            if (key === 'yearRange' && typeof value === 'object' && value !== null) {
              const { start, end } = value as { start: number; end: number }
              if (start > FILTER_LIMITS.YEAR.MIN || end < FILTER_LIMITS.YEAR.MAX) {
                return (
                  <FilterTag
                    key={key}
                    icon={Calendar}
                    label="Years"
                    value={`${start} - ${end}`}
                    size="sm"
                  />
                )
              }
            }
            if (key === 'valueRange' && typeof value === 'object' && value !== null) {
              const { min, max } = value as { min: number; max: number }
              if (min > FILTER_LIMITS.GRANT_VALUE.MIN || max < FILTER_LIMITS.GRANT_VALUE.MAX) {
                return (
                  <FilterTag
                    key={key}
                    icon={DollarSign}
                    label="Values"
                    value={`${formatCurrency(min)} - ${formatCurrency(max)}`}
                    size="sm"
                  />
                )
              }
            }
            if (Array.isArray(value) && value.length > 0) {
              return (
                <FilterTag
                  key={key}
                  icon={Filter}
                  label={key}
                  value={value.join(', ')}
                  size="sm"
                />
              )
            }
            return null
          })}
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRerun(search.search_params)}
        >
          Run Search
        </Button>
      </div>
    </Card>
  )
}