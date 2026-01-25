// src/components/ui/LoadingState.tsx
import React from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
    title?: string;
    message?: string;
    size?: "sm" | "md" | "lg";
    spinnerSize?: "sm" | "md" | "lg";
    fullHeight?: boolean;
    className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
    title = "Loading",
    message = "Please wait...",
    size = "md",
    spinnerSize = "md",
    fullHeight = false,
    className,
}) => {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center w-full",
                // FIX: No borders, no specific bg (transparent), fills parent
                fullHeight ? "h-full" : "p-8",
                className
            )}
        >
            <LoadingSpinner size={spinnerSize} className="mb-3 text-blue-600" />
            {title && (
                <h3 className={cn("font-medium text-gray-900", size === "lg" ? "text-lg" : "text-sm")}>
                    {title}
                </h3>
            )}
            {message && (
                <p className={cn("text-gray-500", size === "lg" ? "text-sm" : "text-xs")}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default LoadingState;
