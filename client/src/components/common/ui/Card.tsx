import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isHoverable?: boolean;
}

export const Card = ({
  children,
  className,
  isHoverable = false,
  ...props
}: CardProps) => (
  <div
    className={cn(
      'bg-white rounded-lg border border-gray-200',
      isHoverable && 'hover:border-gray-300 transition-all duration-200',
      className
    )}
    {...props}
  >
    {children}
  </div>
);