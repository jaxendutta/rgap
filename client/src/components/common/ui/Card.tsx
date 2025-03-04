// src/components/common/ui/Card.tsx
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isHoverable?: boolean;
  header?: React.ReactNode;
}

export const Card = ({
  children,
  className,
  isHoverable = false,
  header,
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
    {header && <div className="border-b border-gray-200">{header}</div>}
    {children}
  </div>
);