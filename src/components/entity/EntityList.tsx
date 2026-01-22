// src/components/entity/EntityList.tsx
'use client';

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { EntityType } from "@/types/database";
import {
    LuGrid2X2,
    LuList,
    LuDollarSign,
    LuHash,
    LuCalendar,
} from "react-icons/lu";
import { MdSortByAlpha } from "react-icons/md";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SortButton } from "@/components/ui/SortButton";
import { AnimatePresence, motion } from "framer-motion";
import TrendVisualizer, { ViewContext } from "@/components/visualizations/TrendVisualizer";
import { IconType } from "react-icons";
import { TbGraph, TbGraphOff } from "react-icons/tb";
import Pagination from "@/components/ui/Pagination";

export interface SortOption {
    label: string;
    field: string;
    icon: IconType;
}

export const DEFAULT_SORT_OPTIONS: Record<EntityType, SortOption[]> = {
    grant: [
        { label: "Value", field: "agreement_value", icon: LuDollarSign },
        { label: "Date", field: "agreement_start_date", icon: LuCalendar },
        { label: "Recipient", field: "recipient", icon: MdSortByAlpha },
    ],
    institute: [
        { label: "Funding", field: "total_funding", icon: LuDollarSign },
        { label: "Grants", field: "grant_count", icon: LuHash },
        { label: "Name", field: "name", icon: MdSortByAlpha },
    ],
    recipient: [
        { label: "Funding", field: "total_funding", icon: LuDollarSign },
        { label: "Grants", field: "grant_count", icon: LuHash },
        { label: "Name", field: "legal_name", icon: MdSortByAlpha },
    ],
}

export type LayoutVariant = "list" | "grid";

export interface EntityListProps<T> {
    entityType: EntityType;
    entities?: T[];
    totalCount: number;
    children: React.ReactNode;
    sortOptions?: SortOption[];
    showVisualization?: boolean;
    visualizationData?: any[];
    viewContext?: ViewContext;

    entityId?: number;
    isLoading?: boolean;
    isError?: boolean;
    error?: Error | unknown;
    emptyMessage?: string;
    className?: string;
    // Pagination Props
    page?: number;
    pageSize?: number;
}

function EntityList<T>(props: EntityListProps<T>) {
    const {
        entityType,
        entities = [],
        totalCount,
        children,
        sortOptions = DEFAULT_SORT_OPTIONS[entityType],
        // RESTORED: Defaults
        showVisualization = false,
        visualizationData = [],
        viewContext = "search",

        entityId,
        isLoading = false,
        isError = false,
        error,
        emptyMessage = "No items found.",
        className,
        page = 1,
        pageSize = 15,
    } = props;

    const router = useRouter();
    const searchParams = useSearchParams();

    const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>("grid");
    // RESTORED: State for visibility
    const [isVisualizationVisible, setIsVisualizationVisible] = useState(false);

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
        params.set('page', '1');
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`, { scroll: true });
    };

    if (isError) return <ErrorState title="Error" message={error instanceof Error ? error.message : "Error"} />;
    if (isLoading) return <LoadingState title="Loading..." message={`Loading ${entityType}s...`} />;
    if (!entities || entities.length === 0) return <EmptyState title="No results" message={emptyMessage} />;

    return (
        <div className={cn("space-y-6", className)}>
            <Card variant="default" className="flex flex-wrap justify-between items-center rounded-3xl p-2 bg-white backdrop-blur-xs border border-gray-100 gap-4 sm:gap-0">
                <span className="text-xs md:text-sm text-gray-500 px-2 flex-grow text-center sm:text-left">
                    Showing <span className="font-semibold text-gray-900">{entities.length}</span> of{' '}
                    <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span>{' '}
                    {entityType}{totalCount !== 1 ? 's' : ''}
                </span>

                <div className="flex gap-2 flex-wrap flex-grow justify-center sm:justify-end">
                    {sortOptions.map((option) => (
                        <SortButton
                            key={option.field}
                            label={option.label}
                            icon={option.icon}
                            field={option.field}
                            currentField={currentSortField}
                            direction={currentSortDir}
                            onClick={() => handleSort(option.field)}
                        />
                    ))}

                    <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

                    {/* RESTORED: Visualization Toggle Button */}
                    {showVisualization && visualizationData.length > 0 && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsVisualizationVisible(!isVisualizationVisible)}
                            className={cn(
                                "transition-colors gap-1.5 py-1.5",
                                isVisualizationVisible ? "bg-blue-50 text-blue-600" : "text-gray-600"
                            )}
                        >
                            {isVisualizationVisible ? <TbGraphOff className="w-5 h-5" /> : <TbGraph className="w-5 h-5" />}
                            <span className="hidden md:inline">{isVisualizationVisible ? "Hide Trends" : "Show Trends"}</span>
                        </Button>
                    )}

                    <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={layoutVariant === 'grid' ? LuList : LuGrid2X2}
                        onClick={() => setLayoutVariant(layoutVariant === 'list' ? 'grid' : 'list')}
                        aria-label="Toggle layout"
                        className="hidden sm:flex"
                    />
                </div>
            </Card>

            {/* RESTORED: Trend Visualizer Component */}
            <AnimatePresence>
                {isVisualizationVisible && showVisualization && visualizationData.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden w-full"
                    >
                        <TrendVisualizer
                            grants={visualizationData}
                            height={350}
                            viewContext={viewContext}
                            entityId={entityId}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className={cn(
                    layoutVariant === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                        : "space-y-4"
                )}
            >
                {children}
            </div>

            <Pagination
                currentPage={page}
                totalPages={Math.ceil(totalCount / pageSize)}
                onPageChange={handlePageChange}
            />
        </div>
    );
}

export default EntityList;
