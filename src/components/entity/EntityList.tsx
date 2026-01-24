// src/components/entity/EntityList.tsx
'use client';

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn, getSortOptions } from "@/lib/utils";
import { EntityType } from "@/types/database";
import { LuGrid2X2, LuList } from "react-icons/lu";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SortButton } from "@/components/ui/SortButton";
import { AnimatePresence, motion } from "framer-motion";
import TrendVisualizer, { ViewContext } from "@/components/visualizations/TrendVisualizer";
import { TbGraph, TbGraphOff } from "react-icons/tb";
import Pagination from "@/components/ui/Pagination";
import { SortOption } from "@/types/database";
import { DEFAULT_ITEM_PER_PAGE } from "@/constants/data";

export type LayoutVariant = "list" | "grid";

export interface EntityListProps<T> {
    entityType: EntityType;
    entities?: T[];
    totalCount: number;
    page?: number;
    pageSize?: number;

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
}

function EntityList<T>(props: EntityListProps<T>) {
    const {
        entityType,
        entities = [],
        totalCount,
        page = 1,
        pageSize,
        children,
        showVisualization = false,
        visualizationData = [],
        viewContext = "search",

        entityId,
        isLoading = false,
        isError = false,
        error,
        emptyMessage = "No items found.",
        className,
    } = props;

    const sortOptions = props.sortOptions || getSortOptions(entityType, entityType as any);

    const router = useRouter();
    const searchParams = useSearchParams();

    const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>("grid");
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
                <span className="text-xs md:text-sm text-gray-500 px-2 text-center sm:text-left">
                    Showing <span className="font-semibold text-gray-900">{entities.length}</span> of{' '}
                    <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span>{' '}
                    {entityType}{totalCount !== 1 ? 's' : ''}
                </span>

                <div className="flex gap-2 flex-wrap items-center justify-center sm:justify-end">
                    {sortOptions.map((option) => (
                        <SortButton
                            key={typeof option.field === "symbol" ? String(option.field) : String(option.field)}
                            label={option.label}
                            icon={option.icon}
                            field={String(option.field)}
                            currentField={String(currentSortField)}
                            direction={currentSortDir}
                            onClick={() => handleSort(String(option.field))}
                        />
                    ))}

                    <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

                    {/* Visualization Toggle Button */}
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

            {/* Trend Visualizer Component */}
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
                        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start"
                        : "space-y-4"
                )}
            >
                {children}
            </div>

            <Pagination
                currentPage={page}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
            />
        </div>
    );
}

export default EntityList;
