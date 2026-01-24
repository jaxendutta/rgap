// src/components/entity/EntityList.tsx
'use client';

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn, getSortOptions } from "@/lib/utils";
import { EntityType } from "@/types/database";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { AnimatePresence, motion } from "framer-motion";
import TrendVisualizer, { ViewContext } from "@/components/visualizations/TrendVisualizer";
import Pagination from "@/components/ui/Pagination";
import { SortOption } from "@/types/database";
import { DEFAULT_ITEM_PER_PAGE } from "@/constants/data";
import { ListHeader } from "@/components/ui/ListHeader";

export type LayoutVariant = "list" | "grid";

export interface EntityListProps<T> {
    entityType: EntityType;
    entities?: T[];
    totalCount: number;
    page?: number;
    pageSize?: number;
    children: React.ReactNode;
    sortOptions?: SortOption[];
    initialLayoutVariant?: LayoutVariant;
    showLayoutToggle?: boolean;
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
        pageSize = DEFAULT_ITEM_PER_PAGE,
        children,
        initialLayoutVariant = "grid",
        showLayoutToggle = true,
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

    const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>(initialLayoutVariant);
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
            <ListHeader
                totalCount={totalCount}
                showingCount={entities.length}
                entityType={entityType}

                sortOptions={sortOptions}
                currentSortField={String(currentSortField)}
                currentSortDir={currentSortDir}
                onSort={handleSort}

                showVisualization={showVisualization}
                isVisualizationVisible={isVisualizationVisible}
                onToggleVisualization={() => setIsVisualizationVisible(!isVisualizationVisible)}
                hasVisualizationData={visualizationData.length > 0}

                showLayoutToggle={showLayoutToggle}
                layoutVariant={layoutVariant}
                onToggleLayout={() => setLayoutVariant(layoutVariant === 'list' ? 'grid' : 'list')}
            />

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
