// src/components/common/ui/ErrorState.tsx
import React from "react";
import { FileWarning, RefreshCw, ChevronLeft } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/utils/cn";

interface ErrorStateProps {
    // Content
    title?: string;
    message?: string;

    // Actions
    onRetry?: () => void;
    onBack?: () => void;
    retryLabel?: string;
    backLabel?: string;

    // Appearance
    variant?: "default" | "inline" | "banner";
    size?: "sm" | "md" | "lg";
    icon?: React.ElementType;

    // Customization
    className?: string;
    titleClassName?: string;
    messageClassName?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
    title = "Something went wrong",
    message = "We encountered a problem while loading your data. Please try again.",
    onRetry,
    onBack,
    retryLabel = "Try again",
    backLabel = "Go back",
    variant = "default",
    size = "md",
    icon: CustomIcon,
    className,
    titleClassName,
    messageClassName,
}) => {
    const Icon = CustomIcon || FileWarning;

    // Variant-specific classes
    const variantClasses = {
        default: "bg-white rounded-lg border border-gray-200 p-6 text-center",
        inline: "bg-red-50 border border-red-200 rounded-lg p-4",
        banner: "bg-red-50 border-l-4 border-red-500 p-4",
    };

    // Size-specific classes
    const iconSizes = {
        sm: "h-8 w-8",
        md: "h-12 w-12",
        lg: "h-16 w-16",
    };

    const titleSizes = {
        sm: "text-sm",
        md: "text-lg",
        lg: "text-xl",
    };

    const messageSizes = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
    };

    return (
        <div className={cn(variantClasses[variant], className)}>
            <div
                className={cn(
                    "flex",
                    variant === "default"
                        ? "flex-col items-center"
                        : "items-start",
                    variant === "banner" && "items-center"
                )}
            >
                <Icon
                    className={cn(
                        variant === "default"
                            ? "mx-auto mb-4"
                            : "mr-4 flex-shrink-0",
                        iconSizes[size],
                        variant === "default" ? "text-red-500" : "text-red-400"
                    )}
                />

                <div className={variant !== "default" ? "flex-1" : ""}>
                    <h3
                        className={cn(
                            "font-medium text-gray-900",
                            titleSizes[size],
                            titleClassName
                        )}
                    >
                        {title}
                    </h3>

                    <p
                        className={cn(
                            "mt-1",
                            messageSizes[size],
                            variant === "default"
                                ? "text-gray-600 mb-4"
                                : "text-gray-500",
                            messageClassName
                        )}
                    >
                        {message}
                    </p>

                    {(onRetry || onBack) && (
                        <div
                            className={cn(
                                "flex gap-3",
                                variant === "default"
                                    ? "justify-center mt-4"
                                    : "mt-3"
                            )}
                        >
                            {onBack && (
                                <Button
                                    variant="outline"
                                    size={size === "lg" ? "md" : "sm"}
                                    icon={ChevronLeft}
                                    onClick={onBack}
                                >
                                    {backLabel}
                                </Button>
                            )}

                            {onRetry && (
                                <Button
                                    variant="primary"
                                    size={size === "lg" ? "md" : "sm"}
                                    icon={RefreshCw}
                                    onClick={onRetry}
                                >
                                    {retryLabel}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorState;
