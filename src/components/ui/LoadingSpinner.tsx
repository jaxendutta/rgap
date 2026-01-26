// src/components/common/ui/LoadingSpinner.tsx
import { cn } from '@/lib/utils'
import { GiAbstract014 } from 'react-icons/gi'

export interface LoadingSpinnerProps {
  spinnerSize?: number;
  className?: string
}

export const LoadingSpinner = ({ spinnerSize = 8, className }: LoadingSpinnerProps) => {
  return (
    <GiAbstract014 className={cn(
      `animate-spin-loader text-blue-600/80 size-[${spinnerSize}vh] flex-shrink-0`,
      className
    )} />
  )
}

export default LoadingSpinner;
