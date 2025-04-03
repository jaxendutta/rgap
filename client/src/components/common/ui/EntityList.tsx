// src/components/common/ui/EntityList.tsx
import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import {
    MoreHorizontal,
    X,
    LineChart,
    Grid,
    List,
} from "lucide-react";
import { SortButton } from "./SortButton";
import { Button } from "./Button";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { UseQueryResult, UseInfiniteQueryResult } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { getSortOptions, SortConfig } from "@/types/search";
import TrendVisualizer from "@/components/features/visualizations/TrendVisualizer";
import { Grant, Entity } from "@/types/models";

export type LayoutVariant = "list" | "grid";

function isInfiniteQuery(
    query:
        | UseInfiniteQueryResult<any, Error>
        | UseQueryResult<any, Error>
        | null
        | undefined
): query is UseInfiniteQueryResult<any, Error> {
    return (
        query !== null &&
        query !== undefined &&
        "fetchNextPage" in query &&
        typeof query.fetchNextPage === "function"
    );
}

export interface EntityListProps<T> {
    // Content props
    entityType: keyof Entity;
    entities?: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    variant?: LayoutVariant;
    emptyMessage?: string;
    emptyState?: React.ReactNode;

    // Optional infinite query props
    query: UseInfiniteQueryResult<any, Error> | UseQueryResult<any, Error>;

    // Optional loading/error state props (for manually managing these states)
    isLoading?: boolean;
    isError?: boolean;
    error?: Error | unknown;

    // Context for visualization
    viewContext?: "search" | "recipient" | "institute" | "custom";
    entityId?: number;

    // Optional additional class
    className?: string;

    // Layout toggle
    allowLayoutToggle?: boolean;

    // Show visualization
    showVisualization?: boolean;
    visualizationData?: Grant[];
    showVisualizationInitially?: boolean;
}

function EntityList<T>(props: EntityListProps<T>) {
    const {
        entityType,
        entities = [],
        renderItem,
        variant = "list",
        emptyState,
        emptyMessage = "No items found.",
        query,
        viewContext = "search",
        entityId,
        className,
        allowLayoutToggle = true,
        showVisualization = true,
        visualizationData,
        showVisualizationInitially = false,
    } = props;

    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: "0px 0px 500px 0px", // Trigger 500px before reaching the end
    });

    // State for layout variant (if toggle is allowed)
    const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>(variant);

    // Get sort options from constants
    const sortOptions = getSortOptions(entityType)

    // Internal sort state - initialized with initialSortConfig or the first option in sortOptions
    const [sortConfig, setSortConfig] = useState<SortConfig<T>>(() => {
        if (sortOptions && sortOptions.length > 0) {
            return {
                field: sortOptions[0].field,
                direction: "desc",
            };
        }
        // Fallback
        return { field: "id" as keyof T, direction: "desc" };
    });

    // Handle loading and error states - either from props or from infiniteQuery
    const isLoading =
        props.isLoading !== undefined ? props.isLoading : query?.isLoading;
    const isError =
        props.isError !== undefined ? props.isError : query?.isError;
    const error = props.error !== undefined ? props.error : query?.error;
    const isFetchingNextPage = isInfiniteQuery(query)
        ? query.isFetchingNextPage
        : false;
    const hasNextPage = isInfiniteQuery(query) ? query.hasNextPage : false;

    // Load more data when user scrolls to the bottom
    useEffect(() => {
        if (
            inView &&
            query &&
            isInfiniteQuery(query) &&
            hasNextPage &&
            !isFetchingNextPage
        ) {
            query.fetchNextPage();
        }
    }, [inView, query, hasNextPage, isFetchingNextPage]);

    // Sort change handler that encapsulates all the sorting logic
    const handleSortChange = (field: keyof T) => {
        // Determine new sort direction
        const newDirection =
            field === sortConfig.field && sortConfig.direction === "desc"
                ? "asc"
                : "desc";

        // Create new sort config
        const newSortConfig = {
            field,
            direction: newDirection as "asc" | "desc",
        };

        // Update internal sort state
        setSortConfig(newSortConfig);

        // If we have a query, handle the sorting by refetching with new parameters
        if (query) {
            // For infinite queries that have fetchNextPage
            if (isInfiniteQuery(query)) {
                // Reset the cache for the infinite query and refetch
                query.refetch();
            }
            // For regular queries, just refetch
            else if (typeof query.refetch === "function") {
                query.refetch();
            }
        }
    };

    // Toggle layout variant
    const toggleLayoutVariant = () => {
        setLayoutVariant((prev) => (prev === "list" ? "grid" : "list"));
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
                onRetry={() => query?.refetch()}
                size="md"
            />
        );
    }

    // Handle initial loading state
    if (isLoading && entities?.length === 0) {
        return <LoadingState title={`Loading ${entityType}...`} size="md" />;
    }

    // Handle empty state
    if (!isLoading && entities?.length === 0) {
        return (
            emptyState || (
                <EmptyState
                    title={`No ${entityType} Found`}
                    message={emptyMessage}
                    size="md"
                />
            )
        );
    }

    // Get total items count for display
    const displayTotalItems = entities.length;
    const displayTotalCount = query
        ? query.data?.pages[0]?.metadata?.totalCount
        : entities.length;

    const [isVisualizationVisible, setIsVisualizationVisible] =
    useState<boolean>(
        showVisualizationInitially || false
    );

    const visualizationToggle={
        isVisible: isVisualizationVisible,
        toggle: () =>
            setIsVisualizationVisible(!isVisualizationVisible),
        showToggleButton: true,
    }

    return (
        <div className={className}>
            {/* Header with sort controls and visualization toggle */}
            <div className="flex justify-between items-end border-b pb-2">
                <div className="flex flex-col lg:flex-row lg:items-center">
                    <span className="text-xs lg:text-sm text-gray-500 lg:ml-2">
                        {`Showing `}
                        <span className="font-semibold">
                            {displayTotalItems.toLocaleString()}
                        </span>
                        {` out of `}
                        <span className="font-semibold">
                            {displayTotalCount.toLocaleString()}
                        </span>
                        {entityType === "search"
                            ? ` search records`
                            : ` ${entityType.toLowerCase()}s`}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    {sortOptions.map((option) => (
                        <SortButton
                            key={String(option.field)}
                            label={option.label}
                            icon={option.icon}
                            field={option.field}
                            currentField={sortConfig.field}
                            direction={sortConfig.direction}
                            onClick={() => handleSortChange(option.field)}
                        />
                    ))}

                    {visualizationToggle?.showToggleButton &&
                        showVisualization &&
                        visualizationData &&
                        visualizationData.length > 0 && (
                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={
                                    visualizationToggle.isVisible
                                        ? X
                                        : LineChart
                                }
                                onClick={visualizationToggle.toggle}
                                disabled={visualizationData.length === 0}
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
                        ></Button>
                    )}
                </div>
            </div>

            {/* Visualization Section */}
            {showVisualization && visualizationToggle?.isVisible && (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.98 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.98 }}
                        transition={{
                            duration: 0.5,
                            height: {
                                type: "spring",
                                stiffness: 100,
                                damping: 15,
                            },
                            opacity: { duration: 0.4, ease: "easeInOut" },
                            scale: { duration: 0.4, ease: "easeInOut" },
                        }}
                        className="overflow-hidden mt-4 mb-6"
                    >
                        {/* Get loading state from either visualization data source */}
                        {visualizationData && visualizationData.length > 0 ? (
                            <TrendVisualizer
                                grants={visualizationData}
                                viewContext={viewContext}
                                entityId={entityId}
                                height={350}
                            />
                        ) : (
                            <div className="flex justify-center items-center h-40 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">
                                    No data available for visualization
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Items list or grid */}
            <div
                className={cn(
                    layoutVariant === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
                        : "space-y-4 mt-4"
                )}
            >
                {entities?.map((entity, index) => (
                    <React.Fragment key={index}>
                        {renderItem(entity, index)}
                    </React.Fragment>
                ))}
            </div>

            {/* Loading indicator for infinite scroll */}
            {query && isInfiniteQuery(query) && (
                <div ref={ref} className="flex justify-center py-4 h-16">
                    {isFetchingNextPage ? (
                        <LoadingState
                            title=""
                            message={`Loading more ${entityType.toLowerCase()} data...`}
                            size="sm"
                        />
                    ) : hasNextPage ? (
                        <Button
                            variant="outline"
                            leftIcon={MoreHorizontal}
                            onClick={() => query.fetchNextPage()}
                        >
                            Load More
                        </Button>
                    ) : (entities?.length ?? 0) > 0 ? (
                        <p className="text-sm text-gray-500">
                            All {entityType.toLowerCase()}s loaded
                        </p>
                    ) : null}
                </div>
            )}
        </div>
    );
}

export default EntityList;
