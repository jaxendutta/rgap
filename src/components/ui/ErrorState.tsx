// src/components/ui/ErrorState.tsx
import React from "react";
import { LuFileWarning, LuRefreshCw } from "react-icons/lu";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    retryLabel?: string;
    className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
    title = "Unable to load data",
    message = "There was a problem loading this chart.",
    onRetry,
    retryLabel = "Try again",
    className,
}) => {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center w-full h-full p-4",
            className
        )}>
            <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center mb-3">
                <LuFileWarning className="h-5 w-5 text-red-500" />
            </div>

            <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
            <p className="text-xs text-gray-500 text-center mb-4 max-w-[200px]">{message}</p>

            {onRetry && (
                <Button variant="outline" size="sm" leftIcon={LuRefreshCw} onClick={onRetry}>
                    {retryLabel}
                </Button>
            )}
        </div>
    );
};

export default ErrorState;
