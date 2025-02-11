// src/pages/SearchPage.tsx
import { useState, useCallback, useEffect } from 'react'
import { Search as SearchIcon, BookmarkPlus, BookmarkCheck, Calendar, DollarSign, LineChart as ChartIcon, SlidersHorizontal, X } from 'lucide-react'
import { useGrantSearch } from '@/hooks/api/useGrants'
import { FilterPanel } from '@/components/features/grants/FilterPanel'
import { FilterTags } from '@/components/common/ui/FilterTags'
import { SearchResults } from '@/components/features/grants/SearchResults'
import { Card } from '@/components/common/ui/Card'
import { Button } from '@/components/common/ui/Button'
import { SortButton } from '@/components/common/ui/SortButton'
import { DEFAULT_FILTER_STATE } from '@/constants/filters'
import type { SortConfig, GrantSearchParams } from '@/types/search'

export const SearchPage = () => {
  // Split the search parameters into two states
  const [searchTerms, setSearchTerms] = useState({
    recipient: '',
    institute: '',
    grant: ''
  });

  // Keep track of the last searched terms to know when to keep showing results
  const [lastSearchedTerms, setLastSearchedTerms] = useState({
    recipient: '',
    institute: '',
    grant: ''
  });

  const [showVisualization, setShowVisualization] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'date',
    direction: 'desc'
  })
  const [filters, setFilters] = useState(DEFAULT_FILTER_STATE)
  const [isInitialState, setIsInitialState] = useState(true)

  // Create the full search params for the API
  const searchParams: GrantSearchParams = {
    searchTerms: lastSearchedTerms, // Use last searched terms
    filters,
    sortConfig
  }

  const { data, isLoading, error, refetch } = useGrantSearch({
    ...searchParams,
    sortConfig: {
      ...searchParams.sortConfig,
      field: searchParams.sortConfig.field === 'results' ? 'date' : searchParams.sortConfig.field
    }
  })

  const handleSearch = useCallback(() => {
    if (searchTerms.recipient === '' && searchTerms.institute === '' && searchTerms.grant === '') {
      setIsInitialState(true)
      return
    }
    setIsInitialState(false)
    setLastSearchedTerms(searchTerms) // Update last searched terms
  }, [searchTerms])

  useEffect(() => {
    if (!isInitialState) {
      refetch()
    }
  }, [lastSearchedTerms, refetch, isInitialState])

  const handleInputChange = (field: keyof typeof searchTerms, value: string) => {
    setSearchTerms(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSort = (field: SortConfig['field']) => {
    setSortConfig(prev => {
      const newConfig: SortConfig = {
        field,
        direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
      }
      return newConfig
    })
    // TODO: Make it so that it doesn't search everytime the sort changes!
    handleSearch()
  }

  const handleFilterChange = (newFilters: GrantSearchParams['filters']) => {
    setFilters(newFilters)
    handleSearch()
  }

  const handleBookmark = useCallback((grantId: string) => {
    console.log('Bookmarking grant:', grantId)
  }, [])

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Advanced Search</h1>
        <Button
          variant="outline"
          icon={SlidersHorizontal}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Search Fields */}
      <div className="grid gap-4">
        {[
          { field: 'recipient', placeholder: 'Search by recipient...' },
          { field: 'institute', placeholder: 'Search by institute...' },
          { field: 'grant', placeholder: 'Search by grant...' }
        ].map(({ field, placeholder }) => (
          <div key={field} className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder={placeholder}
              value={searchTerms[field as keyof typeof searchTerms]}
              onChange={(e) => handleInputChange(field as keyof typeof searchTerms, e.target.value)}
              onKeyDown={(e) => {
                handleInputChange(field as keyof typeof searchTerms, (e.target as HTMLInputElement).value)
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              className="w-full pl-10 pr-2.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
            />
          </div>
        ))}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="transition-all duration-300 ease-in-out">
          <Card className="p-4">
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
            />
          </Card>
        </div>
      )}

      {/* Filter Tags */}
      <FilterTags
        filters={filters}
        onRemove={(type, value) => {
          // Handle filter removal
          const newFilters = { ...filters }
          if (Array.isArray(newFilters[type as keyof typeof filters])) {
            (newFilters[type as keyof typeof filters] as string[]) =
              (newFilters[type as keyof typeof filters] as string[]).filter(v => v !== value)
          } else if (type === 'yearRange') {
            newFilters.yearRange = DEFAULT_FILTER_STATE.yearRange
          } else if (type === 'valueRange') {
            newFilters.valueRange = DEFAULT_FILTER_STATE.valueRange
          }
          setFilters(newFilters)
          handleSearch()
        }}
        onClearAll={() => {
          setFilters(DEFAULT_FILTER_STATE)
          handleSearch()
        }}
      />

      {/* Search Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          icon={isBookmarked ? BookmarkCheck : BookmarkPlus}
          onClick={() => setIsBookmarked(!isBookmarked)}
        >
          Bookmark Search
        </Button>

        <Button
          variant="primary"
          icon={SearchIcon}
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>

      {/* Results Header with Sort Controls */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
          <h2 className="text-lg font-medium">Search Results</h2>
          {!isInitialState && !isLoading && (
            <span className="text-sm text-gray-500 ml-1">
              ({data?.length || 0} results)
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <SortButton
            label="Date"
            icon={Calendar}
            field="date"
            currentField={sortConfig.field}
            direction={sortConfig.direction}
            onClick={() => handleSort('date')}
          />
          <SortButton
            label="Value"
            icon={DollarSign}
            field="value"
            currentField={sortConfig.field}
            direction={sortConfig.direction}
            onClick={() => handleSort('value')}
          />
          <Button
            variant="outline"
            size="sm"
            icon={showVisualization ? X : ChartIcon}
            onClick={() => setShowVisualization(!showVisualization)}
          >
            {showVisualization ? 'Hide Trends' : 'Show Trends'}
          </Button>
        </div>
      </div>

      {/* Results */}
      <SearchResults
        data={data}
        isLoading={isLoading}
        error={error}
        onBookmark={handleBookmark}
        showVisualization={showVisualization}
        isEmptyState={isInitialState}
      />
    </div>
  )
}