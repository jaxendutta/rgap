import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search as SearchIcon,
  BookmarkPlus,
  University,
  GraduationCap,
  BookMarked,
  FileText,
  SlidersHorizontal,
  BookmarkCheck,
  Calendar,
  DollarSign,
  LineChart as ChartIcon,
  X
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { clsx } from 'clsx'
import { Link } from 'react-router-dom'
import { RangeFilter, MultiSelect, FilterTags } from '../components/filter/FilterComponents'
import { DEFAULT_FILTER_STATE, FilterValues } from '../components/filter/constants'
import { ResearchGrant, Recipient } from '../types/models'

import { useGrantSearch } from '../hooks/useGrantSearch'

// Data
// Make a copy of the mock data for now
/*
import { mock_data, mockInstitutes, filterOptions } from '../test-data/mockdata'
const recipients: Recipient[] = [...mock_data.Recipient]
const results: ResearchGrant[] = [...mock_data.ResearchGrant]
const institutes = [...mockInstitutes]
*/

// Types
type SortField = 'date' | 'value'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  direction: SortDirection
}

interface SearchTerms {
  recipient: string
  institute: string
  grant: string
}

// Filter Options
const filterOptions = {
  agency: ['NSERC', 'SSHRC', 'CIHR'],
  country: ['Canada', 'United States', 'United Kingdom', 'France', 'Germany'],
  province: ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba'],
  city: ['Toronto', 'Montreal', 'Vancouver', 'Ottawa', 'Edmonton']
}

// Components
const SortButton = ({
  label,
  icon: Icon,
  field,
  currentField,
  direction,
  onClick
}: {
  label: string
  icon: React.ElementType
  field: string
  currentField: string
  direction: SortDirection
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={clsx(
      'flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md hover:bg-gray-50',
      currentField === field ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
    )}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
    {currentField === field && (
      <span className="text-gray-900">
        {direction === 'asc' ? '↑' : '↓'}
      </span>
    )}
  </button>
)

const SearchField = ({
  field,
  icon: Icon,
  onSearch,
  searchTerms,
  setSearchTerms
}: {
  field: keyof SearchTerms
  icon: React.ElementType
  onSearch: (field: keyof SearchTerms, value: string) => void
  searchTerms: SearchTerms
  setSearchTerms: React.Dispatch<React.SetStateAction<SearchTerms>>
}) => {
  const [inputValue, setInputValue] = useState(searchTerms[field])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setSearchTerms(prev => ({ ...prev, [field]: inputValue }))
      onSearch(field, inputValue)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      if (inputRef.current) {
        inputRef.current.blur()
      }
    }
  }, [inputValue, field, onSearch, setSearchTerms])

  useEffect(() => {
    setInputValue(searchTerms[field])
  }, [searchTerms, field])

  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="search"
        placeholder={`Search by ${field}...`}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        className="w-full pl-10 pr-2.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
      />
    </div>
  )
}

// Transform results for visualization
const transformResultsForVisualization = (results: ResearchGrant[]) => {
  const yearMap = new Map()

  results.forEach(result => {
    const year = new Date(result.agreement_start_date).getFullYear()
    const value = result.agreement_value

    if (!yearMap.has(year)) {
      yearMap.set(year, {
        year,
        NSERC: 0,
        SSHRC: 0,
        CIHR: 0
      })
    }

    const yearData = yearMap.get(year)
    yearData[result.org] += value
  })

  return Array.from(yearMap.values())
    .sort((a, b) => a.year - b.year)
}

// Sort function
const sortResults = (results: ResearchGrant[], config: SortConfig): ResearchGrant[] => {
  return [...results].sort((a, b) => {
    if (config.field === 'value') {
      return config.direction === 'asc' ? a.agreement_value - b.agreement_value : b.agreement_value - a.agreement_value
    } else { // date
      const aDate = new Date(a.agreement_start_date).getTime()
      const bDate = new Date(b.agreement_start_date).getTime()
      return config.direction === 'asc' ? aDate - bDate : bDate - aDate
    }
  })
}

export const SearchPage = () => {
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerms, setSearchTerms] = useState<SearchTerms>({
    recipient: '',
    institute: '',
    grant: ''
  })
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTER_STATE)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'date',
    direction: 'desc'
  })
  const [showBookmarkOptions, setShowBookmarkOptions] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)

  const filterRef = useRef<HTMLDivElement>(null)
  const bookmarkRef = useRef<HTMLDivElement>(null)

  // Add the search query
  const { data: searchResults, isLoading, error, refetch } = useGrantSearch({
    searchTerms,
    filters,
    sortConfig
  })

  const handleSearch = () => {
    console.log('Initiating search with:', {
      searchTerms,
      filters,
      sortConfig
    })
    refetch()
  }

  const handleBookmarkSearch = () => {
    setIsBookmarked(prev => !prev)
    setTimeout(() => setIsBookmarked(false), 1000)
  }

  const handleBookmark = (type: string, id: string) => {
    console.log(`Bookmarking ${type} with id ${id}`)
    setShowBookmarkOptions(null)
  }

  const handleRemoveFilter = (type: string, value: string) => {
    setFilters(prev => {
      if (type === 'yearRange') {
        return { ...prev, yearRange: { start: DEFAULT_FILTER_STATE.yearRange.start, end: DEFAULT_FILTER_STATE.yearRange.end } }
      }
      if (type === 'valueRange') {
        return { ...prev, valueRange: DEFAULT_FILTER_STATE.valueRange }
      }
      return {
        ...prev,
        [type]: Array.isArray(prev[type as keyof FilterValues])
          ? (prev[type as keyof FilterValues] as string[]).filter((v: string) => v !== value)
          : prev[type as keyof FilterValues]
      }
    })
  }

  const handleClearAllFilters = () => {
    setFilters(DEFAULT_FILTER_STATE)
  }

  const toggleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  // Apply sorting to results
  // const sortedResults = sortResults(results, sortConfig)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Advanced Search</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Search Fields */}
      <div className="grid gap-4">
        <SearchField
          field="recipient"
          icon={GraduationCap}
          onSearch={handleSearch}
          searchTerms={searchTerms}
          setSearchTerms={setSearchTerms}
        />
        <SearchField
          field="institute"
          icon={University}
          onSearch={handleSearch}
          searchTerms={searchTerms}
          setSearchTerms={setSearchTerms}
        />
        <SearchField
          field="grant"
          icon={FileText}
          onSearch={handleSearch}
          searchTerms={searchTerms}
          setSearchTerms={setSearchTerms}
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div ref={filterRef} className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Range Filters */}
            <RangeFilter
              label="Year"
              type="year"
              value={{ min: Number(filters.yearRange.start) || 1990, max: Number(filters.yearRange.end) || new Date().getFullYear() }}
              onChange={(range) => setFilters(prev => ({
                ...prev,
                yearRange: {
                  start: range.min.toString(),
                  end: range.max.toString()
                }
              }))}
            />

            <RangeFilter
              label="Value"
              type="currency"
              value={filters.valueRange}
              onChange={(range) => setFilters(prev => ({
                ...prev,
                valueRange: range
              }))}
            />

            {/* Multi-select Filters */}
            <MultiSelect
              label="Funding Agencies"
              options={filterOptions.agency}
              values={filters.agencies}
              onChange={(values) => setFilters(prev => ({ ...prev, agencies: values }))}
            />
            <MultiSelect
              label="Countries"
              options={filterOptions.country}
              values={filters.countries}
              onChange={(values) => setFilters(prev => ({ ...prev, countries: values }))}
            />
            <MultiSelect
              label="Provinces"
              options={filterOptions.province}
              values={filters.provinces}
              onChange={(values) => setFilters(prev => ({ ...prev, provinces: values }))}
            />
            <MultiSelect
              label="Cities"
              options={filterOptions.city}
              values={filters.cities}
              onChange={(values) => setFilters(prev => ({ ...prev, cities: values }))}
            />
          </div>
        </div>
      )}

      {/* Filter Tags */}
      <FilterTags
        filters={filters}
        onRemove={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Search Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleSearch}
          className="flex items-center pl-3 pr-4 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          title="Search"
        >
          <SearchIcon className="h-4 w-4 mr-2" />
          Search
        </button>
        <button
          onClick={handleBookmarkSearch}
          className={clsx(
            "flex items-center pl-3 pr-4 py-1 rounded-md border bg-transparent transition-colors duration-1000",
            isBookmarked
              ? "text-green-600 border-green-600"
              : "text-gray-500 border-dashed border-gray-400 hover:text-gray-900"
          )}
          title="Bookmark Search"
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-4 w-4 mr-2" />
          ) : (
            <BookmarkPlus className="h-4 w-4 mr-2" />
          )}
          Bookmark Search
        </button>
      </div>

      {/* Results Header with Sort Controls */}
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-lg font-medium">Search Results</h2>
        <div className="flex items-center space-x-2">
          <SortButton
            label="Date"
            icon={Calendar}
            field="date"
            currentField={sortConfig.field}
            direction={sortConfig.direction}
            onClick={() => toggleSort('date')}
          />
          <SortButton
            label="Value"
            icon={DollarSign}
            field="value"
            currentField={sortConfig.field}
            direction={sortConfig.direction}
            onClick={() => toggleSort('value')}
          />
          <button
            onClick={() => setShowVisualization(!showVisualization)}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md',
              showVisualization
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            {showVisualization ? (
              <X className="h-4 w-4" />
            ) : (
              <ChartIcon className="h-4 w-4" />
            )}
            <span>{showVisualization ? 'Hide Trends' : 'Show Trends'}</span>
          </button>
        </div>
      </div>

      {/* Visualization Panel */}
      {showVisualization && searchResults && searchResults.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Funding Trends by Agency</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={transformResultsForVisualization(searchResults)}
                margin={{ top: 10, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tickFormatter={(value) => `${value / 1000}K`}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    new Intl.NumberFormat('en-CA', {
                      style: 'currency',
                      currency: 'CAD',
                      maximumFractionDigits: 0
                    }).format(value),
                    name
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="NSERC"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="SSHRC"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={{ fill: '#7c3aed', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="CIHR"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ fill: '#059669', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="space-y-4">
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center space-y-2">
              <span className="text-gray-500">Loading results...</span>
              <span className="text-sm text-gray-400">This may take a few seconds</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center py-8 text-red-500">
            <div className="flex flex-col items-center space-y-2">
              <span>Error loading results</span>
              <span className="text-sm">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </span>
            </div>
          </div>
        )}

        {searchResults && !isLoading && searchResults.length === 0 && (
          <div className="flex justify-center py-8">
            <span className="text-gray-500">No results found</span>
          </div>
        )}

        {searchResults && !isLoading && searchResults.length > 0 && searchResults.map((result) => (
          <div
            key={result.ref_number}
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 relative"
          >
            <button
              onClick={() => setShowBookmarkOptions(result.ref_number)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <BookmarkPlus className="h-5 w-5" />
            </button>

            {/* Result Content */}
            <div className="pr-8">
              {/* Main Info */}
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium text-lg">
                    <Link
                      to={`/recipients/${result.recipient_id}`}
                      className="text-lg font-medium hover:text-blue-600 transition-colors"
                    >
                      {result.legal_name}
                    </Link>
                  </h3>
                  <p className="text-gray-600">
                    <Link
                      to={`/institutes/${result.research_organization_name}`}
                      className="flex items-center hover:text-blue-600 transition-colors"
                    >
                      <University className="h-4 w-4 mr-1.5" />
                      {result.research_organization_name}
                    </Link>
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <BookMarked className="h-4 w-4 mr-1.5" />
                    {result.agreement_title_en}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center pt-0.5">
                    <FileText className="h-4 w-4 mr-1.5" />
                    Ref: {result.ref_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-lg">
                    {new Intl.NumberFormat('en-CA', {
                      style: 'currency',
                      currency: 'CAD',
                      maximumFractionDigits: 0
                    }).format(result.agreement_value)}
                  </p>
                  <p className="text-gray-600">{result.org}</p>
                  <p className="text-sm text-gray-500">{result.city}, {result.province}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(result.agreement_start_date).getFullYear()} - {new Date(result.agreement_end_date).getFullYear()}
                  </p>
                </div>
              </div>
            </div>

            {/* Bookmark Options Dropdown */}
            {showBookmarkOptions === result.ref_number && (
              <div
                ref={bookmarkRef}
                className="absolute right-4 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 w-48"
              >
                {[
                  { type: 'grant', icon: FileText, label: 'Bookmark Grant' },
                  { type: 'recipient', icon: GraduationCap, label: 'Bookmark Recipient' },
                  { type: 'institute', icon: University, label: 'Bookmark Institute' }
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => handleBookmark(type, result.ref_number)}
                    className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}