// src/components/common/ui/EntityList.tsx
import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { MoreHorizontal, LucideIcon } from "lucide-react";
import { SortButton } from "./SortButton";
import { Button } from "./Button";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { UseInfiniteQueryResult } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
    field: string;
    direction: SortDirection;
}

interface EntityListProps<T> {
    // Content props
    title: string;
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    keyExtractor: (item: T) => string;
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
}

function EntityList<T>({
    title,
    items,
    renderItem,
    keyExtractor,
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
}: EntityListProps<T>) {
    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: "0px 0px 500px 0px", // Trigger 500px before reaching the end
    });

    // Handle infinite query loading
    const isLoading = infiniteQuery?.isLoading;
    const isError = infiniteQuery?.isError;
    const error = infiniteQuery?.error;
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
        return <LoadingState title={`Loading ${title}...`} size="md" />;
    }

    // Handle empty state
    if (!isLoading && items.length === 0) {
        return (
            <EmptyState
                title={`No ${title} Found`}
                message={emptyMessage}
                size="md"
            />
        );
    }

    return (
        <div className={className}>
            {/* Header with sort controls and visualization toggle */}
            <div className="flex justify-between items-center border-b pb-2">
                <div className="flex flex-col lg:flex-row lg:items-center">
                    <div className="text-lg font-medium">{title}</div>
                    {totalCount !== undefined && totalItems !== undefined && (
                        <span className="text-sm text-gray-500 lg:ml-2">
                            ({totalItems.toLocaleString()} out of{" "}
                            {totalCount.toLocaleString()} results)
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
                            variant="outline"
                            size="sm"
                            icon={
                                visualizationToggle.isVisible
                                    ? MoreHorizontal
                                    : MoreHorizontal
                            }
                            onClick={visualizationToggle.toggle}
                            disabled={items.length === 0}
                            className="lg:space-x-2"
                        >
                            <span className="hidden lg:inline">
                                {visualizationToggle.isVisible
                                    ? "Hide Trends"
                                    : "Show Trends"}
                            </span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Visualization Section */}
            {visualization && visualizationToggle?.isVisible && (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-4 mb-6"
                    >
                        {visualization}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Items list */}
            <div className="space-y-4 mt-4">
                {items.map((item) => (
                    <React.Fragment key={keyExtractor(item)}>
                        {renderItem(item)}
                    </React.Fragment>
                ))}
            </div>

            {/* Loading indicator for infinite scroll */}
            {infiniteQuery && (
                <div ref={ref} className="flex justify-center py-4 h-16">
                    {isFetchingNextPage ? (
                        <LoadingState
                            title=""
                            message={`Loading more ${title.toLowerCase()}...`}
                            size="sm"
                        />
                    ) : hasNextPage ? (
                        <Button
                            variant="outline"
                            icon={MoreHorizontal}
                            onClick={() => infiniteQuery.fetchNextPage()}
                        >
                            Load More
                        </Button>
                    ) : items.length > 0 ? (
                        <p className="text-sm text-gray-500">
                            All {title.toLowerCase()} loaded
                        </p>
                    ) : null}
                </div>
            )}
        </div>
    );
}

export default EntityList;
