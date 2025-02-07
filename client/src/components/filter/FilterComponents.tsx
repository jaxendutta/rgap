import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'

interface YearFilterProps {
  value: { start: string; end: string }
  onChange: (range: { start: string; end: string }) => void
}

export const YearRangeFilter = ({ value, onChange }: YearFilterProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentYear = new Date().getFullYear()
  
  const quickRanges = [
    { label: 'Last 5 years', range: { start: String(currentYear - 4), end: String(currentYear) }},
    { label: 'Last 10 years', range: { start: String(currentYear - 9), end: String(currentYear) }},
    { label: 'Custom range...', range: null }
  ]

  const selectedRange = value.start && value.end
    ? `${value.start} - ${value.end}`
    : 'Select years'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-48 px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
      >
        <span>{selectedRange}</span>
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-64 mt-1 bg-white rounded-md shadow-lg border">
          <div className="p-2 space-y-1">
            {quickRanges.map(({ label, range }) => (
              <button
                key={label}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-md"
                onClick={() => {
                  if (range) {
                    onChange(range)
                    setIsOpen(false)
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface ValueRangeProps {
  value: { min: number; max: number }
  onChange: (range: { min: number; max: number }) => void
  maxRange?: number
}

export const ValueRangeFilter = ({ value, onChange, maxRange = 1000000 }: ValueRangeProps) => {
  const [localValue, setLocalValue] = useState(value)
  const [isEditing, setIsEditing] = useState(false)

  const handleInputChange = (type: 'min' | 'max', inputValue: string) => {
    const numValue = parseFloat(inputValue.replace(/[^0-9.]/g, ''))
    if (!isNaN(numValue)) {
      const newValue = {
        ...localValue,
        [type]: numValue
      }
      setLocalValue(newValue)
    }
  }

  const handleSliderChange = (type: 'min' | 'max', val: number) => {
    const newValue = {
      ...localValue,
      [type]: val
    }
    setLocalValue(newValue)
    onChange(newValue)
  }

  const formatValue = (val: number) => 
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0
    }).format(val)

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center space-x-4">
        <input
          type="range"
          min={0}
          max={maxRange}
          value={localValue.min}
          onChange={(e) => handleSliderChange('min', parseInt(e.target.value))}
          className="w-full"
        />
        <input
          type="range"
          min={localValue.min}
          max={maxRange}
          value={localValue.max}
          onChange={(e) => handleSliderChange('max', parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="relative">
          <input
            type="text"
            value={isEditing ? String(localValue.min) : formatValue(localValue.min)}
            onChange={(e) => handleInputChange('min', e.target.value)}
            onFocus={() => setIsEditing(true)}
            onBlur={() => {
              setIsEditing(false)
              onChange(localValue)
            }}
            className="w-32 px-3 py-1 text-sm border rounded-md"
          />
        </div>
        <span className="text-gray-500">to</span>
        <div className="relative">
          <input
            type="text"
            value={isEditing ? String(localValue.max) : formatValue(localValue.max)}
            onChange={(e) => handleInputChange('max', e.target.value)}
            onFocus={() => setIsEditing(true)}
            onBlur={() => {
              setIsEditing(false)
              onChange(localValue)
            }}
            className="w-32 px-3 py-1 text-sm border rounded-md"
          />
        </div>
      </div>
    </div>
  )
}

interface MultiSelectProps {
  label: string
  options: string[]
  values: string[]
  onChange: (values: string[]) => void
}

export const MultiSelect = ({ label, options, values, onChange }: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

export const FilterTags = ({ filters, onRemove, onClearAll }: FilterTagsProps) => {
  const hasFilters = filters.agencies.length > 0 || 
    filters.countries.length > 0 || 
    filters.provinces.length > 0 || 
    filters.cities.length > 0 ||
    (filters.yearRange.start && filters.yearRange.end) ||
    (filters.valueRange.min > 0 || filters.valueRange.max < 1000000)

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

        {(filters.valueRange.min > 0 || filters.valueRange.max < 1000000) && (
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

const DualRangeSlider = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  formatValue = (v: number) => v.toString(),
  type = 'currency'
}: DualRangeSliderProps) => {
  const [localValue, setLocalValue] = useState(value)
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    const rawValue = min + (max - min) * percent
    const steppedValue = Math.round(rawValue / step) * step

    if (isDragging === 'min') {
      const newMin = Math.min(steppedValue, localValue.max - step)
      setLocalValue(prev => ({ ...prev, min: newMin }))
      onChange({ ...localValue, min: newMin })
    } else {
      const newMax = Math.max(steppedValue, localValue.min + step)
      setLocalValue(prev => ({ ...prev, max: newMax }))
      onChange({ ...localValue, max: newMax })
    }
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', () => setIsDragging(null))
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', () => setIsDragging(null))
    }
  }, [isDragging, localValue])

  const handleInputChange = (type: 'min' | 'max', inputValue: string) => {
    const numValue = parseFloat(inputValue.replace(/[^0-9.]/g, ''))
    if (isNaN(numValue)) return

    const newValue = {
      ...localValue,
      [type]: numValue
    }

    if (type === 'min' && numValue < newValue.max) {
      setLocalValue(newValue)
      onChange(newValue)
    } else if (type === 'max' && numValue > newValue.min) {
      setLocalValue(newValue)
      onChange(newValue)
    }
  }

  const getLeftPercent = () => ((localValue.min - min) / (max - min)) * 100
  const getRightPercent = () => ((localValue.max - min) / (max - min)) * 100

  return (
    <div className="px-2 py-4 space-y-6">
      {/* Slider */}
      <div 
        ref={sliderRef}
        className="relative w-full h-2 bg-gray-200 rounded-full cursor-pointer"
      >
        {/* Selected Range */}
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{
            left: `${getLeftPercent()}%`,
            right: `${100 - getRightPercent()}%`
          }}
        />
        
        {/* Min Handle */}
        <div
          className="absolute top-1/2 -ml-3 -mt-3 w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-grab"
          style={{ left: `${getLeftPercent()}%` }}
          onMouseDown={() => setIsDragging('min')}
        />
        
        {/* Max Handle */}
        <div
          className="absolute top-1/2 -ml-3 -mt-3 w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-grab"
          style={{ left: `${getRightPercent()}%` }}
          onMouseDown={() => setIsDragging('max')}
        />
      </div>

      {/* Input Fields */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={formatValue(localValue.min)}
            onChange={e => handleInputChange('min', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border rounded-md"
          />
        </div>
        <span className="text-gray-500">to</span>
        <div className="flex-1">
          <input
            type="text"
            value={formatValue(localValue.max)}
            onChange={e => handleInputChange('max', e.target.value)}
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

export const RangeFilter = ({
  label,
  type,
  value,
  onChange,
  min: propMin,
  max: propMax
}: RangeFilterProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const formatValue = (val: number) => {
    if (type === 'currency') {
      return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        maximumFractionDigits: 0
      }).format(val)
    }
    return val.toString()
  }

  const min = propMin ?? (type === 'currency' ? 0 : 1990)
  const max = propMax ?? (type === 'currency' ? 1000000 : new Date().getFullYear())
  const step = type === 'currency' ? 1000 : 1

  const displayValue = 
    value.min === min && value.max === max 
      ? 'Any'
      : `${formatValue(value.min)} - ${formatValue(value.max)}`

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
        <span className="flex items-center gap-2">
          <span className="font-medium">{label}:</span>
          <span className="text-gray-600">{displayValue}</span>
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-72 mt-1 bg-white rounded-lg shadow-lg border">
          <div className="p-4">
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
      )}
    </div>
  )
}