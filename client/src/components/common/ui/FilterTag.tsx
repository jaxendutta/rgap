// src/components/common/ui/FilterTag.tsx
import { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface FilterTagProps {
  icon: LucideIcon
  label: string
  value: string | string[]
  className?: string
  size?: 'sm' | 'md'
}

export const FilterTag = ({ 
  icon: Icon, 
  label, 
  value, 
  className,
  size = 'md' 
}: FilterTagProps) => {
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4'
  }

  return (
    <span 
      className={cn(
        'inline-flex items-center rounded-md bg-gray-100 text-gray-700 gap-1.5',
        sizes[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {label && <span className="font-medium">{label}:</span>}
      <span className="truncate">
        {Array.isArray(value) ? value.join(', ') : value}
      </span>
    </span>
  )
}