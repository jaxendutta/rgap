// src/components/common/ui/Card.tsx
import React from "react";
import { cn } from "@/utils/cn";
import { applyTheme, themeClasses } from "@/utils/themeUtils";

// Card Container
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    isHoverable?: boolean;
    isInteractive?: boolean;
    variant?: "default" | "outline" | "filled";
    disableOverflow?: boolean;
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
                applyTheme("card"),
                disableOverflow && "overflow-hidden",
                variant === "outline" && "border-2",
                variant === "filled" && themeClasses.bg.secondary,
                isHoverable &&
                    "hover:border-border-secondary hover:shadow-md transition-all duration-200",
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
                "p-4 border-b border-border-primary flex items-center justify-between",
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
                    <Icon className="h-5 w-5 mr-3 text-accent-primary flex-shrink-0" />
                )}

                <div>
                    {title && (
                        <h3
                            className={cn(
                                themeClasses.text.primary,
                                "text-md font-medium"
                            )}
                        >
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className={themeClasses.text.secondary}>
                            {subtitle}
                        </p>
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
                bordered && "border-t border-border-primary",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

// Composite Card Component
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export { Card };
