// src/components/ui/LoadingState.tsx
import React from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
    title?: string;
    message?: string;
    size?: "sm" | "md" | "lg";
    spinnerSize?: number;
    fullHeight?: boolean;
    className?: string;
    messageClassName?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
    title = "Loading",
    message = "Please wait...",
    size = "md",
    spinnerSize,
    fullHeight = false,
    className,
    messageClassName,
}) => {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center w-full",
                fullHeight ? "h-full" : "p-8",
                className
            )}
        >
            <LoadingSpinner spinnerSize={spinnerSize} className="mb-10 md:mb-20 text-blue-600/80 flex-shrink-0" />
            {title && (
                <h3 className={cn("font-medium text-gray-900", size === "lg" ? "text-lg" : "text-sm")}>
                    {title}
                </h3>
            )}
            {message && (
                <p className={cn("text-gray-500", size === "lg" ? "text-sm" : "text-xs", messageClassName)}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default LoadingState;
