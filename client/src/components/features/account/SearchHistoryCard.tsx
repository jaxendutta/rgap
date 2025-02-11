// src/components/features/account/SearchHistoryCard.tsx
import { Search, Calendar, DollarSign, Filter, FileText, GraduationCap, University, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/common/ui/Button'
import { Card } from '@/components/common/ui/Card'
import { FilterTag } from '@/components/common/ui/FilterTag'
import { formatCurrency } from '@/utils/format'
import { cn } from '@/utils/cn'
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
  isSelected: boolean
  onToggleSelect: () => void
}

export const SearchHistoryCard = ({ 
  search, 
  onRerun, 
  isSelected,
  onToggleSelect 
}: SearchHistoryCardProps) => {
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
          return value.start !== FILTER_LIMITS.YEAR.MIN || value.end !== FILTER_LIMITS.YEAR.MAX
        }
        if ('min' in value && 'max' in value) {
          return value.min > FILTER_LIMITS.GRANT_VALUE.MIN || value.max < FILTER_LIMITS.GRANT_VALUE.MAX
        }
      }
      return false
    })

  return (
    <Card 
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        isSelected ? 'ring-2 ring-gray-900' : 'hover:border-gray-400'
      )}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-500">
              {new Date(search.timestamp).toLocaleDateString()} at {new Date(search.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRerun(search.search_params)}
            >
              Run Search
            </Button>
          </div>
        </div>

        {/* Search Terms */}
        <motion.div
          initial={false}
          animate={{ height: 'auto' }}
          className="space-y-2 mb-3"
        >
          {searchTerms.map(({ key, value, icon: Icon }) => (
            <div key={key} className="flex items-center space-x-2">
              <Icon className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-900">{value}</span>
            </div>
          ))}
        </motion.div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {activeFilters.map(([key, value]) => {
              if (key === 'yearRange' && typeof value === 'object' && value !== null) {
                const { start, end } = value as { start: number; end: number }
                if (start || end) {
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
                if (typeof min === 'number' && typeof max === 'number' && (min > 0 || max < Infinity)) {
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

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 mt-2 pt-2 border-t">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>{search.results} results</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSelect}
            className="group"
          >
            <span>Details</span>
            <ChevronDown 
              className={cn(
                "h-4 w-4 ml-1 transition-transform",
                isSelected && "rotate-180"
              )} 
            />
          </Button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t bg-gray-50">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Sort Configuration</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{search.search_params.sortConfig.field}</span>
                    <span>•</span>
                    <span>{search.search_params.sortConfig.direction}</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onRerun(search.search_params)}
                >
                  View Full Details
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}