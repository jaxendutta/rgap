// src/components/ui/ListHeader.tsx
'use client';

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SortButton } from "@/components/ui/SortButton";
import { TbGraph, TbGraphOff } from "react-icons/tb";
import { LuGrid2X2, LuList } from "react-icons/lu";
import { IconType } from "react-icons";

export interface SortOption {
    value?: string;
    label: string;
    field: string;
    direction: 'asc' | 'desc';
    icon: IconType;
}

interface ListHeaderProps {
    totalCount: number;
    showingCount: number;
    entityType?: string; // e.g., "grant", "session"

    // Sort Controls
    sortOptions?: SortOption[];
    currentSortField?: string;
    currentSortDir?: 'asc' | 'desc';
    onSort?: (field: string) => void;

    // Visualization Controls
    showVisualization?: boolean;
    isVisualizationVisible?: boolean;
    onToggleVisualization?: () => void;
    hasVisualizationData?: boolean;

    // Layout Controls
    showLayoutToggle?: boolean;
    layoutVariant?: "list" | "grid";
    onToggleLayout?: () => void;

    className?: string;
}

export function ListHeader({
    totalCount,
    showingCount,
    entityType = "item",
    sortOptions = [],
    currentSortField,
    currentSortDir,
    onSort,
    showVisualization = false,
    isVisualizationVisible = false,
    onToggleVisualization,
    hasVisualizationData = false,
    showLayoutToggle = false,
    layoutVariant,
    onToggleLayout,
    className,
}: ListHeaderProps) {
    return (
        <Card variant="default" className={cn("flex flex-wrap sm:flex-nowrap justify-between items-center rounded-3xl p-2 bg-white backdrop-blur-xs border border-gray-100 gap-4 sm:gap-0", className)}>
            <div className="w-full md:flex-1 text-xs md:text-sm justify-center sm:justify-start text-gray-500 px-2 md:px-4 flex flex-wrap gap-1 items-center">
                <span>Showing</span>
                <span className="font-semibold text-gray-900">{showingCount}</span>
                <span>of</span>
                <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span>
                <span>{entityType}{entityType == "search" ? " item" : ""}{totalCount !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex gap-2 flex-nowrap items-center justify-center sm:justify-end w-full md:flex-1">
                {sortOptions.map((option) => (
                    <SortButton
                        key={String(option.field)}
                        label={option.label}
                        icon={option.icon}
                        field={String(option.field)}
                        currentField={String(currentSortField)}
                        direction={currentSortDir || 'desc'}
                        onClick={() => onSort && onSort(String(option.field))}
                    />
                ))}

                {(showVisualization || showLayoutToggle) && sortOptions.length > 0 && (
                    <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
                )}

                {/* Visualization Toggle */}
                {showVisualization && hasVisualizationData && onToggleVisualization && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onToggleVisualization}
                        className={cn(
                            "transition-colors gap-1.5 py-1.5",
                            isVisualizationVisible ? "bg-blue-50 text-blue-600" : "text-gray-600"
                        )}
                    >
                        {isVisualizationVisible ? <TbGraphOff className="w-5 h-5" /> : <TbGraph className="w-5 h-5" />}
                        <span className="hidden md:inline whitespace-nowrap">{isVisualizationVisible ? "Hide Trends" : "Show Trends"}</span>
                    </Button>
                )}

                {/* Layout Toggle */}
                {showLayoutToggle && onToggleLayout && (
                    <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={layoutVariant === 'grid' ? LuList : LuGrid2X2}
                        onClick={onToggleLayout}
                        aria-label="Toggle layout"
                        className="hidden sm:flex"
                    />
                )}
            </div>
        </Card>
    );
}
