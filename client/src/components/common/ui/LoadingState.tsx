// src/components/common/ui/LoadingState.tsx
import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { cn } from "@/utils/cn";

interface LoadingStateProps {
    // Content
    title?: string;
    message?: string;

    // Appearance
    size?: "sm" | "md" | "lg";
    spinnerSize?: "sm" | "md" | "lg";
    fullHeight?: boolean;
    overlay?: boolean;

    // Customization
    className?: string;
    titleClassName?: string;
    messageClassName?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
    title = "Loading",
    message = "Please wait while we load your content",
    size = "md",
    spinnerSize = "md",
    fullHeight = false,
    overlay = false,
    className,
    titleClassName,
    messageClassName,
}) => {
    const containerClasses = cn(
        "flex flex-col items-center justify-center",
        fullHeight && "h-full min-h-[300px]",
        overlay && "absolute inset-0 bg-white bg-opacity-80 z-50",
        className
    );

    const titleClasses = cn(
        "font-medium text-gray-700",
        size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-lg",
        titleClassName
    );

    const messageClasses = cn(
        "text-gray-500",
        size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm",
        messageClassName
    );

    return (
        <div className={containerClasses}>
            <LoadingSpinner size={spinnerSize} className="mb-4" />
            {title && <h3 className={titleClasses}>{title}</h3>}
            {message && <p className={messageClasses}>{message}</p>}
        </div>
    );
};

export default LoadingState;
