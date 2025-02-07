import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Search as SearchIcon, 
  BookmarkPlus, 
  University,
  GraduationCap,
  FileText,
  SlidersHorizontal,
  BookmarkCheck
} from 'lucide-react'
import { clsx } from 'clsx'

const filterOptions = {
  year: ['2024', '2023', '2022', '2021', '2020'],
  agency: ['NSERC', 'SSHRC', 'CIHR'],
  value: ['< $10,000', '$10,000 - $50,000', '$50,000 - $100,000', '$100,000+'],
  country: ['Canada', 'International', 'United States', 'United Kingdom', 'France'],
  province: ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
  city: ['Toronto', 'Montreal', 'Vancouver', 'Ottawa']
}

const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ref, handler])
}

export const SearchPage = () => {
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerms, setSearchTerms] = useState({
    recipient: '',
    institute: '',
    grant: ''
  })
  const [filters, setFilters] = useState({
    year: '',
    agency: '',
    value: '',
    country: '',
    province: '',
    city: ''
  })
  const [sortConfig, setSortConfig] = useState({
    field: 'value',
    direction: 'desc'
  })
  const [showBookmarkOptions, setShowBookmarkOptions] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const filterRef = useRef<HTMLDivElement>(null)
  const bookmarkRef = useRef<HTMLDivElement>(null)

  useClickOutside(bookmarkRef, () => setShowBookmarkOptions(null))

  const handleSearch = (field: keyof typeof searchTerms, value: string) => {
    console.log(`Searching by ${field} for ${value}`)
  }

  const handleBookmarkSearch = () => {
    console.log('Bookmarking search')
    setIsBookmarked(prev => !prev)
  }

  const handleBookmark = (type: string, id: string) => {
    console.log(`Bookmarking ${type} with id ${id}`)
    setShowBookmarkOptions(null)
  }

  const SearchField = ({
    field,
    icon: Icon
  }: {
    field: keyof typeof searchTerms,
    icon: React.ElementType
  }) => {
    const [inputValue, setInputValue] = useState(searchTerms[field]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Use useCallback to prevent unnecessary re-creations of the handler
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    }, []); // Empty dependency array because it doesn't depend on any props or state

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setSearchTerms(prev => ({ ...prev, [field]: inputValue })); // Update searchTerms on Enter
        handleSearch(field, inputValue); // Use local inputValue to search
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }
    }, [inputValue, field, handleSearch]); // Dependencies: inputValue, field, handleSearch

    useEffect(() => {
      setInputValue(searchTerms[field]);
    }, [searchTerms, field]); // Correct dependency array: searchTerms and field

    return (
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="search"
          placeholder={`Search by ${field}...`}
          value={inputValue} // Use the local input value
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={inputRef} // Assign the ref to the input
          className="w-full pl-10 pr-2.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
        />
      </div>
    );
  };

  const FilterSelect = ({ 
    label, 
    options, 
    value, 
    onChange 
  }: { 
    label: string
    options: string[]
    value: string
    onChange: (value: string) => void
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 pl-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-8 text-base focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 appearance-none"
        >
          <option value="">No Selection</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  )

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
        <SearchField field="recipient" icon={GraduationCap} />
        <SearchField field="institute" icon={University} />
        <SearchField field="grant" icon={FileText} />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div ref={filterRef} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-lg border border-gray-200">
          <FilterSelect 
            label="Year" 
            options={filterOptions.year}
            value={filters.year}
            onChange={(value) => setFilters(prev => ({ ...prev, year: value }))}
          />
          <FilterSelect 
            label="Funding Agency" 
            options={filterOptions.agency}
            value={filters.agency}
            onChange={(value) => setFilters(prev => ({ ...prev, agency: value }))}
          />
          <FilterSelect 
            label="Value" 
            options={filterOptions.value}
            value={filters.value}
            onChange={(value) => setFilters(prev => ({ ...prev, value: value }))}
          />
          <FilterSelect 
            label="Country" 
            options={filterOptions.country}
            value={filters.country}
            onChange={(value) => setFilters(prev => ({ ...prev, country: value }))}
          />
          <FilterSelect 
            label="Province/State" 
            options={filterOptions.province}
            value={filters.province}
            onChange={(value) => setFilters(prev => ({ ...prev, province: value }))}
          />
          <FilterSelect 
            label="City" 
            options={filterOptions.city}
            value={filters.city}
            onChange={(value) => setFilters(prev => ({ ...prev, city: value }))}
          />
        </div>
      )}

      {/* Search Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => handleSearch('recipient', searchTerms.recipient)}
          className="flex items-center pl-3 pr-4 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          title="Search"
        >
          <SearchIcon className="h-4 w-4 mr-2" />
          Search
        </button>
        <button
          onClick={() => {
            handleBookmarkSearch()
            setTimeout(() => setIsBookmarked(false), 1000)
          }}
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

      {/* Results Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-lg font-medium">Search Results</h2>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600">Sort by</span>
          <button
            onClick={() => setSortConfig(prev => ({
              field: 'value',
              direction: prev.field === 'value' && prev.direction === 'asc' ? 'desc' : 'asc'
            }))}
            className={clsx(
              'px-3 py-1 rounded',
              sortConfig.field === 'value' ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Value {sortConfig.field === 'value' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => setSortConfig(prev => ({
              field: 'date',
              direction: prev.field === 'date' && prev.direction === 'asc' ? 'desc' : 'asc'
            }))}
            className={clsx(
              'px-3 py-1 rounded',
              sortConfig.field === 'date' ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Date {sortConfig.field === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        {mockResults.map((result) => (
          <div
            key={result.id}
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
                  <h3 className="font-medium text-lg">{result.recipient}</h3>
                  <p className="text-gray-600">{result.institute}</p>
                  <p className="text-gray-600">{result.grant}</p>
                  <p className="text-sm text-gray-500">Ref: {result.ref_number}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-lg">{result.value}</p>
                  <p className="text-gray-600">{result.agency}</p>
                  <p className="text-sm text-gray-500">{result.city}, {result.province}</p>
                  <p className="text-sm text-gray-500">{result.startDate} - {result.endDate}</p>
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

// Extended mock search results with full dates
const mockResults = [
  {
    id: 1,
    ref_number: 'NSERC-2023-1234',
    recipient: 'Dr. Jane Smith',
    institute: 'University of Toronto',
    grant: 'Advanced Materials Research',
    value: '$75,000',
    startDate: '2023-05-01',
    endDate: '2024-04-30',
    agency: 'NSERC',
    city: 'Toronto',
    province: 'ON'
  },
  {
    id: 2,
    ref_number: 'SSHRC-2022-5678',
    recipient: 'Dr. John Doe',
    institute: 'McGill University',
    grant: 'Social Sciences Research',
    value: '$50,000',
    startDate: '2022-09-01',
    endDate: '2023-08-31',
    agency: 'SSHRC',
    city: 'Montreal',
    province: 'QC'
  },
  {
    id: 3,
    ref_number: 'CIHR-2021-9012',
    recipient: 'Dr. Alice Johnson',
    institute: 'University of British Columbia',
    grant: 'Health Sciences Research',
    value: '$100,000',
    startDate: '2021-01-01',
    endDate: '2022-12-31',
    agency: 'CIHR',
    city: 'Vancouver',
    province: 'BC'
  }
]