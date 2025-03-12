// src/components/common/ui/Button.tsx
import { cn } from '@/utils/cn'
import { LucideIcon } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  isLoading?: boolean
}

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading,
  disabled,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    outline: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-1.5 text-md',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      className={cn(
      "flex items-center justify-center font-medium rounded-md gap-2",
      "transition-colors transition-all duration-800 ease-in-out",
      variants[variant],
      sizes[size],
      (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
      className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
      <>
        {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
        {children}
        {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
      </>
      )}
    </button>
  )
}