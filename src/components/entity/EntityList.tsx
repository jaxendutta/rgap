// src/components/ui/EntityList.tsx
'use client';

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { EntityType } from "@/types/database";
import {
    LuGrid2X2,
    LuList,
    LuChartLine,
    LuX,
    LuDollarSign,
    LuHash,
    LuCalendar,
    LuBuilding2,
    LuUsers
} from "react-icons/lu";
import { MdSortByAlpha } from "react-icons/md";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SortButton } from "@/components/ui/SortButton";
import { AnimatePresence, motion } from "framer-motion";
import TrendVisualizer from "@/components/visualizations/TrendVisualizer";
import { IconType } from "react-icons";

// Icon mapping to fix serialization error
const ICON_MAP: Record<string, IconType> = {
    funding: LuDollarSign,
    count: LuHash,
    text: MdSortByAlpha,
    date: LuCalendar,
    org: LuBuilding2,
    person: LuUsers,
    default: MdSortByAlpha
};

export type IconKey = keyof typeof ICON_MAP;

export interface SortOption {
    label: string;
    field: string;
    icon: IconKey; // Pass the KEY, not the component
}

export type LayoutVariant = "list" | "grid";

export interface EntityListProps<T> {
    entityType: EntityType;
    entities?: T[];
    totalCount: number;
    children: React.ReactNode;

    // Sorting
    sortOptions?: SortOption[];

    // Visualization
    showVisualization?: boolean;
    visualizationData?: any[];

    // States
    isLoading?: boolean;
    isError?: boolean;
    error?: Error | unknown;
    emptyMessage?: string;
    className?: string;
}

function EntityList<T>(props: EntityListProps<T>) {
    const {
        entityType,
        entities = [],
        totalCount,
        children,
        sortOptions = [],
        showVisualization = false,
        visualizationData = [],
        isLoading = false,
        isError = false,
        error,
        emptyMessage = "No items found.",
        className,
    } = props;

    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>("grid");
    const [isVisualizationVisible, setIsVisualizationVisible] = useState(false);

    // URL State helpers
    const currentSortField = searchParams.get('sort') || sortOptions[0]?.field;
    const currentSortDir = (searchParams.get('dir') as 'asc' | 'desc') || 'desc';

    const handleSort = (field: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (field === currentSortField) {
            params.set('dir', currentSortDir === 'desc' ? 'asc' : 'desc');
        } else {
            params.set('sort', field);
            params.set('dir', 'desc');
        }
        params.set('page', '1'); // Reset to page 1
        router.push(`?${params.toString()}`);
    };

    // Render States
    if (isError) {
        return <ErrorState title="Error loading data" message={error instanceof Error ? error.message : "An unknown error occurred"} />;
    }

    if (isLoading) {
        return <LoadingState title="Loading..." message={`Loading ${entityType}s...`} />;
    }

    if (!entities || entities.length === 0) {
        return <EmptyState title="No results found" message={emptyMessage} />;
    }

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header Area */}
            <Card variant="default" className="flex flex-col sm:flex-row justify-between items-center rounded-2xl p-2 bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm gap-4 sm:gap-0">
                <span className="text-xs md:text-sm text-gray-500 px-2">
                    Showing <span className="font-semibold text-gray-900">{entities.length}</span> of{' '}
                    <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span>{' '}
                    {entityType}{totalCount !== 1 ? 's' : ''}
                </span>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                    {/* Sort Buttons */}
                    {sortOptions.map((option) => {
                        const IconComponent = ICON_MAP[option.icon] || ICON_MAP.default;
                        return (
                            <SortButton<{ [key: string]: any }>
                                key={option.field}
                                label={option.label}
                                icon={IconComponent}
                                field={option.field as keyof { [key: string]: any }}
                                currentField={currentSortField as keyof { [key: string]: any }}
                                direction={currentSortDir}
                                onClick={() => handleSort(option.field)}
                            />
                        );
                    })}

                    <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

                    {/* Visualization Toggle */}
                    {showVisualization && visualizationData.length > 0 && (
                        <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={isVisualizationVisible ? LuX : LuChartLine}
                            onClick={() => setIsVisualizationVisible(!isVisualizationVisible)}
                            className={cn(
                                "transition-colors",
                                isVisualizationVisible ? "bg-blue-50 text-blue-600" : ""
                            )}
                        >
                            {isVisualizationVisible ? "Hide Trends" : "Trends"}
                        </Button>
                    )}

                    {/* Layout Toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={layoutVariant === 'grid' ? LuList : LuGrid2X2}
                        onClick={() => setLayoutVariant(layoutVariant === 'list' ? 'grid' : 'list')}
                        aria-label="Toggle layout"
                    />
                </div>
            </Card>

            {/* Visualization Panel */}
            <AnimatePresence>
                {isVisualizationVisible && showVisualization && visualizationData.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <TrendVisualizer
                            grants={visualizationData}
                            height={350}
                            viewContext="search"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content List */}
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
