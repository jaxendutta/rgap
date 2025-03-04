// src/components/common/ui/EmptyState.tsx
import React from "react";
import { FileSearch, Plus, LucideIcon } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/utils/cn";

interface EmptyStateProps {
    // Content
    title?: string;
    message?: string;

    // Actions
    primaryAction?: {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
    };

    // Appearance
    icon?: React.ElementType;
    size?: "sm" | "md" | "lg";
    variant?: "default" | "card";

    // Customization
    className?: string;
    titleClassName?: string;
    messageClassName?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title = "No results found",
    message = "Try adjusting your search or filters to find what you're looking for.",
    primaryAction,
    secondaryAction,
    icon: CustomIcon,
    size = "md",
    variant = "default",
    className,
    titleClassName,
    messageClassName,
}) => {
    const Icon = CustomIcon || FileSearch;

    // Size-specific classes
    const iconSizes = {
        sm: "h-10 w-10",
        md: "h-16 w-16",
        lg: "h-20 w-20",
    };

    const titleSizes = {
        sm: "text-base",
        md: "text-lg",
        lg: "text-xl",
    };

    const messageSizes = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
    };

    // Variant-specific classes
    const variantClasses = {
        default: "py-8",
        card: "bg-white border border-gray-200 rounded-lg p-6",
    };

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center",
                variantClasses[variant],
                className
            )}
        >
            <Icon className={cn("text-gray-400 mb-4", iconSizes[size])} />

            <h3
                className={cn(
                    "font-medium text-gray-900 mb-1",
                    titleSizes[size],
                    titleClassName
                )}
            >
                {title}
            </h3>

            <p
                className={cn(
                    "text-gray-500 max-w-md mx-auto",
                    messageSizes[size],
                    messageClassName
                )}
            >
                {message}
            </p>

            {(primaryAction || secondaryAction) && (
                <div className="flex flex-wrap gap-3 mt-4">
                    {primaryAction && (
                        <Button
                            variant="primary"
                            size={size === "sm" ? "sm" : "md"}
                            icon={primaryAction.icon || Plus}
                            onClick={primaryAction.onClick}
                        >
                            {primaryAction.label}
                        </Button>
                    )}

                    {secondaryAction && (
                        <Button
                            variant="outline"
                            size={size === "sm" ? "sm" : "md"}
                            icon={secondaryAction.icon}
                            onClick={secondaryAction.onClick}
                        >
                            {secondaryAction.label}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
