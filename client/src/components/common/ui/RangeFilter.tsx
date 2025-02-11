// src/components/common/ui/RangeFilter.tsx
import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { FILTER_LIMITS } from '@/constants/filters'
import { cn } from '@/utils/cn'

export interface RangeValue {
  min: number
  max: number
}

export interface RangeFilterProps {
  label: string
  type: 'currency' | 'year'
  value: RangeValue
  onChange: (value: RangeValue) => void
}

export const RangeFilter = ({ 
  label, 
  type, 
  value, 
  onChange 
}: RangeFilterProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get limits based on type
  const limits = type === 'currency' 
    ? FILTER_LIMITS.GRANT_VALUE 
    : FILTER_LIMITS.YEAR

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

  const displayValue = 
    value.min === limits.MIN && value.max === limits.MAX
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

  // Get quick ranges based on type
  const quickRanges = type === 'year'
    ? [
        { label: 'Last 5 years', min: new Date().getFullYear() - 4, max: new Date().getFullYear() },
        { label: 'Last 10 years', min: new Date().getFullYear() - 9, max: new Date().getFullYear() },
        { label: 'All time', min: limits.MIN, max: limits.MAX }
      ]
    : [
        { label: 'Under $50k', min: 0, max: 50_000 },
        { label: '$50k - $200k', min: 50_000, max: 200_000 },
        { label: '$200k - $1M', min: 200_000, max: 1_000_000 },
        { label: 'Over $1M', min: 1_000_000, max: limits.MAX },
        { label: 'All values', min: limits.MIN, max: limits.MAX }
      ]

  const handleInputChange = (input: 'min' | 'max', rawValue: string) => {
    const cleanValue = rawValue.replace(/[^0-9.]/g, '')
    const numValue = Number(cleanValue)
    
    if (!isNaN(numValue)) {
      setLocalValue(prev => ({
        ...prev,
        [input]: input === 'min' 
          ? Math.min(numValue, value.max) 
          : Math.max(numValue, value.min)
      }))
    }
  }

  const handleApply = () => {
    onChange(localValue)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md hover:bg-gray-50",
          isOpen && "border-gray-300 ring-1 ring-gray-300"
        )}
      >
        <span className="flex items-center gap-2">
          <span className="font-medium">{label}:</span>
          <span className="text-gray-600">{displayValue}</span>
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-400 transition-transform",
          isOpen && "transform rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-72 mt-1 bg-white rounded-lg shadow-lg border">
          <div className="p-4">
            <div className="mb-4 space-y-1">
              {quickRanges.map((range) => (
                <button
                  key={range.label}
                  className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-50 rounded"
                  onClick={() => {
                    onChange({ min: range.min, max: range.max })
                    setIsOpen(false)
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Minimum</label>
                  <input
                    type="text"
                    value={formatValue(localValue.min)}
                    onChange={(e) => handleInputChange('min', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border rounded-md"
                  />
                </div>
                <span className="text-gray-500 mt-6">to</span>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Maximum</label>
                  <input
                    type="text"
                    value={formatValue(localValue.max)}
                    onChange={(e) => handleInputChange('max', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border rounded-md"
                  />
                </div>
              </div>

              <button
                onClick={handleApply}
                className="w-full mt-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}