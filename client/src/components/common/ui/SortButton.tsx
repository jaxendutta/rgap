// src/components/common/ui/SortButton.tsx
import { LucideIcon } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/utils/cn'

export type SortDirection = 'asc' | 'desc'

interface SortButtonProps {
  label: string
  icon: LucideIcon
  field: string
  currentField: string
  direction: SortDirection
  onClick: () => void
  className?: string
}

export const SortButton = ({ 
  label, 
  icon: Icon, 
  field, 
  currentField, 
  direction, 
  onClick,
  className 
}: SortButtonProps) => {
  const isActive = currentField === field

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2',
        isActive ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900',
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden lg:flex">{label}</span>
      {isActive && (
        <span className="text-gray-900">
          {direction === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </Button>
  )
}