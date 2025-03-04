// src/components/common/ui/Card.tsx
import React from "react";
import { cn } from "@/utils/cn";

// Card Container
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    isHoverable?: boolean;
    isInteractive?: boolean;
    variant?: "default" | "outline" | "filled";
    disableOverflow?: boolean; // New prop to disable overflow-hidden
}

const Card = ({
    children,
    className,
    isHoverable = false,
    isInteractive = false,
    variant = "default",
    disableOverflow = false,
    ...props
}: CardProps) => {
    return (
        <div
            className={cn(
                "bg-white rounded-lg",
                disableOverflow && "overflow-hidden",
                variant === "default" && "border border-gray-200",
                variant === "outline" && "border-2 border-gray-300",
                variant === "filled" && "bg-gray-50 border border-gray-200",
                isHoverable &&
                    "hover:border-gray-300 hover:shadow-sm transition-all duration-200",
                isInteractive && "cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

// Card Header
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: React.ReactNode;
    icon?: React.ElementType;
    action?: React.ReactNode;
}

const CardHeader = ({
    children,
    className,
    title,
    subtitle,
    icon: Icon,
    action,
    ...props
}: CardHeaderProps) => {
    const IconComponent = typeof Icon === "function" ? Icon : null;

    return (
        <div
            className={cn(
                "p-4 border-b border-gray-100 flex items-center justify-between",
                className
            )}
            {...props}
        >
            <div className="flex items-center">
                {Icon && !IconComponent && (
                    <div className="mr-3 flex-shrink-0">
                        {Icon as React.ReactNode}
                    </div>
                )}
                {Icon && IconComponent && (
                    <Icon className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" />
                )}

                <div>
                    {title && (
                        <h3 className="text-md font-medium text-gray-900">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    )}
                    {children}
                </div>
            </div>

            {action && (
                <div className="ml-auto pl-3 flex-shrink-0">{action}</div>
            )}
        </div>
    );
};

// Card Content
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
}

const CardContent = ({
    children,
    className,
    noPadding = false,
    ...props
}: CardContentProps) => {
    return (
        <div className={cn(noPadding ? "" : "p-4", className)} {...props}>
            {children}
        </div>
    );
};

// Card Footer
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    bordered?: boolean;
}

const CardFooter = ({
    children,
    className,
    bordered = true,
    ...props
}: CardFooterProps) => {
    return (
        <div
            className={cn(
                "p-4",
                bordered && "border-t border-gray-100",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

// Card Stat Item
interface CardStatItemProps {
    label: React.ReactNode;
    value: React.ReactNode;
    icon?: React.ReactNode;
    trend?: "up" | "down" | "neutral";
    className?: string;
}

const CardStatItem = ({
    label,
    value,
    icon,
    trend,
    className,
}: CardStatItemProps) => {
    return (
        <div className={cn("flex justify-between items-start", className)}>
            <div className="flex items-center gap-1.5">
                {icon && <span className="flex-shrink-0">{icon}</span>}
                <span className="text-sm text-gray-600">{label}</span>
            </div>
            <span
                className={cn(
                    "font-medium",
                    trend === "up" && "text-green-600",
                    trend === "down" && "text-red-600"
                )}
            >
                {value}
            </span>
        </div>
    );
};

// Card Divider
const CardDivider = () => <div className="border-t border-gray-100 my-2" />;

// Composite Card Component
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.StatItem = CardStatItem;
Card.Divider = CardDivider;

export { Card };
