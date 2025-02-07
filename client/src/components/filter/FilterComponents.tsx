import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { FILTER_LIMITS } from './constants'

interface MultiSelectProps {
  label: string
  options: string[]
  values: string[]
  onChange: (values: string[]) => void
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, values, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
      >
        <span>{label}</span>
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border">
          <div className="p-2 max-h-60 overflow-auto space-y-1">
            {options.map(option => (
              <label key={option} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300"
                  checked={values.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...values, option])
                    } else {
                      onChange(values.filter(v => v !== option))
                    }
                  }}
                />
                <span className="ml-2 text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface FilterTagsProps {
  filters: {
    yearRange: { start: string; end: string }
    valueRange: { min: number; max: number }
    agencies: string[]
    countries: string[]
    provinces: string[]
    cities: string[]
  }
  onRemove: (type: string, value: string) => void
  onClearAll: () => void
}

export const FilterTags: React.FC<FilterTagsProps> = ({ filters, onRemove, onClearAll }) => {
  const hasValueRangeFilter = filters.valueRange.min > 0 || filters.valueRange.max < 200000000
  const hasFilters = filters.agencies.length > 0 || 
    filters.countries.length > 0 || 
    filters.provinces.length > 0 || 
    filters.cities.length > 0 ||
    (filters.yearRange.start && filters.yearRange.end) ||
    hasValueRangeFilter

  if (!hasFilters) return null

  const formatValue = (val: number) => 
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0
    }).format(val)

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
        {filters.yearRange.start && filters.yearRange.end && (
          <span className="inline-flex items-center px-2 py-1 text-sm bg-gray-100 rounded-md">
            Years: {filters.yearRange.start}-{filters.yearRange.end}
            <button
              onClick={() => onRemove('yearRange', '')}
              className="ml-1 p-0.5 hover:bg-gray-200 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {hasValueRangeFilter && (
          <span className="inline-flex items-center px-2 py-1 text-sm bg-gray-100 rounded-md">
          Value: {formatValue(filters.valueRange.min)} - {formatValue(filters.valueRange.max)}
          <button
            onClick={() => onRemove('valueRange', '')}
            className="ml-1 p-0.5 hover:bg-gray-200 rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

        {filters.agencies.map(agency => (
          <span 
            key={agency}
            className="inline-flex items-center px-2 py-1 text-sm bg-gray-100 rounded-md"
          >
            Agency: {agency}
            <button
              onClick={() => onRemove('agencies', agency)}
              className="ml-1 p-0.5 hover:bg-gray-200 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {filters.countries.map(country => (
          <span 
            key={country}
            className="inline-flex items-center px-2 py-1 text-sm bg-gray-100 rounded-md"
          >
            Country: {country}
            <button
              onClick={() => onRemove('countries', country)}
              className="ml-1 p-0.5 hover:bg-gray-200 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {filters.provinces.map(province => (
          <span 
            key={province}
            className="inline-flex items-center px-2 py-1 text-sm bg-gray-100 rounded-md"
          >
            Province: {province}
            <button
              onClick={() => onRemove('provinces', province)}
              className="ml-1 p-0.5 hover:bg-gray-200 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {filters.cities.map(city => (
          <span 
            key={city}
            className="inline-flex items-center px-2 py-1 text-sm bg-gray-100 rounded-md"
          >
            City: {city}
            <button
              onClick={() => onRemove('cities', city)}
              className="ml-1 p-0.5 hover:bg-gray-200 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

interface DualRangeSliderProps {
  min: number
  max: number
  value: { min: number; max: number }
  onChange: (range: { min: number; max: number }) => void
  step?: number
  formatValue?: (value: number) => string
  type?: 'currency' | 'year'
}

const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  formatValue = (v: number) => v.toString(),
}) => {
  const [rangeValue, setRangeValue] = useState(value)
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
  const [inputValues, setInputValues] = useState({
    min: formatValue(value.min),
    max: formatValue(value.max)
  })
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setRangeValue(value)
    setInputValues({
      min: formatValue(value.min),
      max: formatValue(value.max)
    })
  }, [value, formatValue])

  const handleInputFocus = (inputType: 'min' | 'max') => {
    const currentValue = rangeValue[inputType]
    setInputValues(prev => ({
      ...prev,
      [inputType]: currentValue.toString()
    }))
  }

  const handleInputChange = (inputType: 'min' | 'max', inputValue: string) => {
    const cleanedValue = inputValue.replace(/[^0-9.]/g, '')
    setInputValues(prev => ({
      ...prev,
      [inputType]: cleanedValue
    }))
  }

  const processInputValue = (inputType: 'min' | 'max') => {
    const currentValue = parseFloat(inputValues[inputType])
    if (isNaN(currentValue)) {
      return
    }

    let newValue = Math.max(Math.min(currentValue, max), min)
    
    if (inputType === 'min') {
      newValue = Math.min(newValue, rangeValue.max)
      setRangeValue(prev => ({ ...prev, min: newValue }))
    } else {
      newValue = Math.max(newValue, rangeValue.min)
      setRangeValue(prev => ({ ...prev, max: newValue }))
    }

    const updatedRange = inputType === 'min' 
      ? { ...rangeValue, min: newValue }
      : { ...rangeValue, max: newValue }

    setInputValues({
      min: formatValue(updatedRange.min),
      max: formatValue(updatedRange.max)
    })
    onChange(updatedRange)
  }

  const handleInputBlur = (inputType: 'min' | 'max') => {
    processInputValue(inputType)
  }

  const handleKeyDown = (inputType: 'min' | 'max', e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      processInputValue(inputType)
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    const rawValue = min + (max - min) * percent
    const steppedValue = Math.round(rawValue / step) * step

    if (isDragging === 'min') {
      const newMin = Math.min(steppedValue, rangeValue.max - step)
      setRangeValue(prev => ({ ...prev, min: newMin }))
      onChange({ ...rangeValue, min: newMin })
    } else {
      const newMax = Math.max(steppedValue, rangeValue.min + step)
      setRangeValue(prev => ({ ...prev, max: newMax }))
      onChange({ ...rangeValue, max: newMax })
    }
  }

  useEffect(() => {
    if (isDragging) {
      const handleMouseUp = () => setIsDragging(null)
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, rangeValue])

  const getLeftPercent = () => {
    return ((rangeValue.min - min) / (max - min)) * 100
  }
  
  const getRightPercent = () => {
    return ((rangeValue.max - min) / (max - min)) * 100
  }

  return (
    <div className="px-2 py-4 space-y-6">
      <div ref={sliderRef} className="relative w-full h-2 bg-gray-200 rounded-full cursor-pointer">
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{
            left: `${getLeftPercent()}%`,
            right: `${100 - getRightPercent()}%`
          }}
        />
        <div
          className="absolute top-1/2 -ml-3 -mt-3 w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-grab"
          style={{ left: `${getLeftPercent()}%` }}
          onMouseDown={() => setIsDragging('min')}
        />
        <div
          className="absolute top-1/2 -ml-3 -mt-3 w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-grab"
          style={{ left: `${getRightPercent()}%` }}
          onMouseDown={() => setIsDragging('max')}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={inputValues.min}
            onChange={(e) => handleInputChange('min', e.target.value)}
            onFocus={() => handleInputFocus('min')}
            onBlur={() => handleInputBlur('min')}
            onKeyDown={(e) => handleKeyDown('min', e)}
            className="w-full px-3 py-1.5 text-sm border rounded-md"
          />
        </div>
        <span className="text-gray-500">to</span>
        <div className="flex-1">
          <input
            type="text"
            value={inputValues.max}
            onChange={(e) => handleInputChange('max', e.target.value)}
            onFocus={() => handleInputFocus('max')}
            onBlur={() => handleInputBlur('max')}
            onKeyDown={(e) => handleKeyDown('max', e)}
            className="w-full px-3 py-1.5 text-sm border rounded-md"
          />
        </div>
      </div>
    </div>
  )
}

interface RangeFilterProps {
  label: string
  type: 'currency' | 'year'
  value: { min: number; max: number }
  onChange: (range: { min: number; max: number }) => void
  min?: number
  max?: number
}

export const RangeFilter: React.FC<RangeFilterProps> = ({
  label,
  type,
  value,
  onChange,
  min: propMin,
  max: propMax
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Use constants for limits
  const min = propMin ?? (
    type === 'currency' 
      ? FILTER_LIMITS.GRANT_VALUE.MIN 
      : FILTER_LIMITS.YEAR.MIN
  )
  const max = propMax ?? (
    type === 'currency'
      ? FILTER_LIMITS.GRANT_VALUE.MAX
      : FILTER_LIMITS.YEAR.MAX
  )
  
  const step = type === 'currency' 
    ? FILTER_LIMITS.GRANT_VALUE.DEFAULT_STEP 
    : FILTER_LIMITS.YEAR.DEFAULT_STEP

  // Get quick ranges based on type
  const quickRanges = type === 'year' 
    ? [
        ...FILTER_LIMITS.YEAR.getQuickRanges(),
        { label: 'All time', range: { min, max }}
      ]
    : [
        ...FILTER_LIMITS.GRANT_VALUE.QUICK_RANGES.map(({ label, min, max }) => ({
          label,
          range: { min, max }
        })),
        { label: 'All values', range: { min, max }}
      ]

  const formatValue = (val: number) => 
    type === 'currency'
      ? new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val)
      : val.toString()

  const displayValue = 
    value.min === min && value.max === max 
      ? 'Any'
      : `${formatValue(value.min)} - ${formatValue(value.max)}`

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
      >
        <span className="flex items-center gap-2">
          <span className="font-medium">{label}:</span>
          <span className="text-gray-600">{displayValue}</span>
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-72 mt-1 bg-white rounded-lg shadow-lg border">
          <div className="p-4">
            <div className="mb-4 space-y-1">
              {quickRanges.map((item) => (
                <button
                  key={item.label}
                  className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-50 rounded"
                  onClick={() => {
                    const range = 'range' in item ? item.range : { min: item.min, max: item.max }
                    onChange(range)
                    setIsOpen(false)
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="border-t pt-4">
              <DualRangeSlider
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
                formatValue={formatValue}
                type={type}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}