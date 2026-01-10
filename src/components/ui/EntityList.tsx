// src/components/ui/EntityList.tsx
// Accepts children (rendered components) instead of renderItem function!

'use client';

import React, { useState } from "react";
import { LuGrid2X2, LuList } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { EntityType } from "@/types/database";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

export type LayoutVariant = "list" | "grid";

export interface EntityListProps<T> {
    // Content props
    entityType: EntityType;
    entities?: T[];
    children: React.ReactNode;  // Accept pre-rendered children instead of renderItem!
    variant?: LayoutVariant;
    emptyMessage?: string;
    emptyState?: React.ReactNode;

    // Optional loading/error state props
    isLoading?: boolean;
    isError?: boolean;
    error?: Error | unknown;

    // Optional additional class
    className?: string;

    // Layout toggle
    allowLayoutToggle?: boolean;
}

function EntityList<T>(props: EntityListProps<T>) {
    const {
        entityType,
        entities = [],
        children,
        variant = "list",
        emptyState,
        emptyMessage = "No items found.",
        className,
        allowLayoutToggle = true,
        isLoading = false,
        isError = false,
        error,
    } = props;

    const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>(variant);

    // Show loading state
    if (isLoading) {
        return (
            <LoadingState
                title="Loading..."
                message={`Loading ${entityType}s...`}
            />
        );
    }

    // Show error state
    if (isError) {
        return (
            <ErrorState
                title="Error loading data"
                message={
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred"
                }
            />
        );
    }

    // Show empty state
    if (!entities || entities.length === 0) {
        return emptyState ? (
            <>{emptyState}</>
        ) : (
            <EmptyState
                title="No results found"
                message={emptyMessage}
            />
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header with count and layout toggle */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    {entities.length} {entityType}{entities.length !== 1 ? "s" : ""}
                </div>

                {allowLayoutToggle && (
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setLayoutVariant("list")}
                            className={cn(
                                "px-3 py-2 text-sm transition-colors",
                                layoutVariant === "list"
                                    ? "bg-gray-900 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            )}
                            aria-label="List view"
                        >
                            <LuList className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setLayoutVariant("grid")}
                            className={cn(
                                "px-3 py-2 text-sm transition-colors",
                                layoutVariant === "grid"
                                    ? "bg-gray-900 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            )}
                            aria-label="Grid view"
                        >
                            <LuGrid2X2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Entity list - render children in appropriate layout */}
            <div
                className={cn(
                    layoutVariant === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                        : "space-y-4"
                )}
            >
                {children}
            </div>
        </div>
    );
}

export default EntityList;
