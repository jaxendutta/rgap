// src/components/common/ui/EntityList.tsx
import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { MoreHorizontal, LucideIcon, X, LineChart, Grid, List } from "lucide-react";
import { SortButton } from "./SortButton";
import { Button } from "./Button";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { UseInfiniteQueryResult } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { SortConfig } from "@/types/search";

export type LayoutVariant = "list" | "grid";

interface EntityListProps<T> {
    // Content props
    entityType: string;
    entities: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    keyExtractor: (item: T, index: number) => string | number;
    variant?: LayoutVariant;
    emptyMessage?: string;

    // Sorting props
    sortOptions: Array<{
        field: string;
        label: string;
        icon: LucideIcon;
    }>;
    sortConfig: SortConfig;
    onSortChange: (config: SortConfig) => void;

    // Optional infinite query props
    infiniteQuery?: UseInfiniteQueryResult<any, Error>;

    // Optional loading/error state props (for manually managing these states)
    isLoading?: boolean;
    isError?: boolean;
    error?: Error | unknown;

    // Optional metadata counts
    totalCount?: number;
    totalItems?: number;

    // Optional visualization props
    visualization?: React.ReactNode;
    visualizationToggle?: {
        isVisible: boolean;
        toggle: () => void;
        showToggleButton?: boolean;
    };

    // Optional additional class
    className?: string;
    
    // Layout toggle
    allowLayoutToggle?: boolean;
}

function EntityList<T>(props: EntityListProps<T>) {
    const {
        entityType,
        entities: items,
        renderItem,
        keyExtractor,
        variant = "list",
        emptyMessage = "No items found.",
        sortOptions,
        sortConfig,
        onSortChange,
        infiniteQuery,
        totalCount,
        totalItems,
        visualization,
        visualizationToggle,
        className,
        allowLayoutToggle = false,
    } = props;

    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: "0px 0px 500px 0px", // Trigger 500px before reaching the end
    });

    // State for layout variant (if toggle is allowed)
    const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>(variant);

    // Handle loading and error states - either from props or from infiniteQuery
    const isLoading = props.isLoading !== undefined ? props.isLoading : infiniteQuery?.isLoading;
    const isError = props.isError !== undefined ? props.isError : infiniteQuery?.isError;
    const error = props.error !== undefined ? props.error : infiniteQuery?.error;
    const isFetchingNextPage = infiniteQuery?.isFetchingNextPage;
    const hasNextPage = infiniteQuery?.hasNextPage;

    // Load more data when user scrolls to the bottom
    useEffect(() => {
        if (inView && infiniteQuery && hasNextPage && !isFetchingNextPage) {
            infiniteQuery.fetchNextPage();
        }
    }, [inView, infiniteQuery, hasNextPage, isFetchingNextPage]);

    // Handle sort change
    const handleSortChange = (field: string) => {
        const newSortConfig = {
            field,
            direction:
                sortConfig.field === field && sortConfig.direction === "desc"
                    ? "asc"
                    : "desc",
        } as SortConfig;

        onSortChange(newSortConfig);
    };

    // Toggle layout variant
    const toggleLayoutVariant = () => {
        setLayoutVariant(prev => prev === "list" ? "grid" : "list");
    };

    // Handle error state
    if (isError && error) {
        return (
            <ErrorState
                title="Error Loading Data"
                message={
                    error instanceof Error
                        ? error.message
                        : "Failed to load data"
                }
                onRetry={() => infiniteQuery?.refetch()}
                size="md"
            />
        );
    }

    // Handle initial loading state
    if (isLoading && items.length === 0) {
        return <LoadingState title={`Loading ${entityType}...`} size="md" />;
    }

    // Handle empty state
    if (!isLoading && items.length === 0) {
        return (
            <EmptyState
                title={`No ${entityType} Found`}
                message={emptyMessage}
                size="md"
            />
        );
    }

    return (
        <div className={className}>
            {/* Header with sort controls and visualization toggle */}
            <div className="flex justify-between items-end border-b pb-2">
                <div className="flex flex-col lg:flex-row lg:items-center">
                    {totalCount !== undefined && totalItems !== undefined && (
                        <span className="text-xs lg:text-sm text-gray-500 lg:ml-2">
                            {`Showing `}
                            <span className="font-semibold">
                                {totalItems.toLocaleString()}
                            </span>
                            {` out of `}
                            <span className="font-semibold">
                                {totalCount.toLocaleString()}
                            </span>
                            {` ${entityType.toLowerCase()}s`}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {sortOptions.map((option) => (
                        <SortButton
                            key={option.field}
                            label={option.label}
                            icon={option.icon}
                            field={option.field}
                            currentField={sortConfig.field}
                            direction={sortConfig.direction}
                            onClick={() => handleSortChange(option.field)}
                        />
                    ))}

                    {visualizationToggle?.showToggleButton && visualization && (
                        <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={visualizationToggle.isVisible ? X : LineChart}
                            onClick={visualizationToggle.toggle}
                            disabled={items.length === 0}
                        >
                            <span className="hidden lg:inline">
                                {visualizationToggle.isVisible
                                    ? "Hide Trends"
                                    : "Show Trends"}
                            </span>
                        </Button>
                    )}
                    
                    {/* Layout Toggle Button */}
                    {allowLayoutToggle && (
                        <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={layoutVariant === "grid" ? List : Grid}
                            onClick={toggleLayoutVariant}
                            className="hidden lg:inline-flex"
                        >
                        </Button>
                    )}
                </div>
            </div>

            {/* Visualization Section */}
            {visualization && visualizationToggle?.isVisible && (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.98 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.98 }}
                        transition={{
                            duration: 0.5,
                            height: { type: "spring", stiffness: 100, damping: 15 },
                            opacity: { duration: 0.4, ease: "easeInOut" },
                            scale: { duration: 0.4, ease: "easeInOut" }
                        }}
                        className="overflow-hidden mt-4 mb-6"
                    >
                        {visualization}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Items list or grid */}
            <div className={cn(
                layoutVariant === "grid" 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
                    : "space-y-4 mt-4"
            )}>
                {items.map((item, index) => (
                    <React.Fragment key={keyExtractor(item, index)}>
                        {renderItem(item, index)}
                    </React.Fragment>
                ))}
            </div>

            {/* Loading indicator for infinite scroll */}
            {infiniteQuery && (
                <div ref={ref} className="flex justify-center py-4 h-16">
                    {isFetchingNextPage ? (
                        <LoadingState
                            title=""
                            message={`Loading more ${entityType.toLowerCase()}...`}
                            size="sm"
                        />
                    ) : hasNextPage ? (
                        <Button
                            variant="outline"
                            leftIcon={MoreHorizontal}
                            onClick={() => infiniteQuery.fetchNextPage()}
                        >
                            Load More
                        </Button>
                    ) : items.length > 0 ? (
                        <p className="text-sm text-gray-500">
                            All {entityType.toLowerCase()} loaded
                        </p>
                    ) : null}
                </div>
            )}
        </div>
    );
}

export default EntityList;