// src/components/common/ui/EntityList.tsx
import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { MoreHorizontal, X, LineChart, Grid, List } from "lucide-react";
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
import { Card } from "./Card";

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
        rootMargin: "0px 0px 500px 0px",
    });

    const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>(variant);
    const sortOptions = getSortOptions(entityType);

    const [sortConfig, setSortConfig] = useState<SortConfig<T>>(() => {
        if (sortOptions && sortOptions.length > 0) {
            return {
                field: sortOptions[0].field,
                direction: "desc",
            };
        }
        return { field: "id" as keyof T, direction: "desc" };
    });

    const isLoading =
        props.isLoading !== undefined ? props.isLoading : query?.isLoading;
    const isError =
        props.isError !== undefined ? props.isError : query?.isError;
    const error = props.error !== undefined ? props.error : query?.error;
    const isFetchingNextPage = isInfiniteQuery(query)
        ? query.isFetchingNextPage
        : false;
    const hasNextPage = isInfiniteQuery(query) ? query.hasNextPage : false;

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

    const handleSortChange = (field: keyof T) => {
        const newDirection =
            field === sortConfig.field && sortConfig.direction === "desc"
                ? "asc"
                : "desc";

        const newSortConfig = {
            field,
            direction: newDirection as "asc" | "desc",
        };

        setSortConfig(newSortConfig);

        if (query) {
            if (isInfiniteQuery(query)) {
                query.refetch();
            } else if (typeof query.refetch === "function") {
                query.refetch();
            }
        }
    };

    const toggleLayoutVariant = () => {
        setLayoutVariant((prev) => (prev === "list" ? "grid" : "list"));
    };

    const [isVisualizationVisible, setIsVisualizationVisible] =
        useState<boolean>(showVisualizationInitially || false);

    const visualizationToggle = React.useMemo(() => {
        return {
            isVisible: isVisualizationVisible,
            toggle: () => setIsVisualizationVisible((prev) => !prev),
            showToggleButton: !!visualizationData?.length,
        };
    }, [isVisualizationVisible, visualizationData]);

    // Render content based on loading, error, or empty states
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

    if (isLoading && entities?.length === 0) {
        return <LoadingState title={`Loading ${entityType} records...`} size="md" />;
    }

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

    const displayTotalItems = entities.length;
    const displayTotalCount =
        query?.data?.pages?.[0]?.metadata?.totalCount ?? entities.length;

    return (
        <div className={cn("flex flex-col gap-2 pt-2", className)}>
            {/* Header with sort controls and visualization toggle */}
            <Card variant="default" className="flex justify-between items-center rounded-4xl p-2 bg-transparent shadow-none">
                <span className="text-xs md:text-sm text-gray-500 px-2">
                    {`Fetched `}
                    <span className="font-semibold">
                        {displayTotalItems.toLocaleString()}
                    </span>
                    {` out of `}
                    <span className="font-semibold">
                        {displayTotalCount.toLocaleString()}
                    </span>
                    {displayTotalCount > 1 ? ` records` : ` record`}
                </span>

                {/* Sort controls */}
                <div className="flex items-center gap-2">
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
                                responsiveText="hideOnMobile"
                            >
                                {visualizationToggle.isVisible
                                    ? "Hide Trends"
                                    : "Show Trends"}
                            </Button>
                        )}

                    {/* Layout Toggle Button */}
                    {allowLayoutToggle && (
                        <Button
                            variant="secondary"
                            leftIcon={layoutVariant === "grid" ? List : Grid}
                            onClick={toggleLayoutVariant}
                            className="hidden lg:inline-flex"
                        />
                    )}
                </div>
            </Card>

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
                        className="overflow-hidden"
                    >
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
                    "mt-2",
                    layoutVariant === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        : "space-y-4"
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
                            message={`Loading more data...`}
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
                            All records loaded
                        </p>
                    ) : null}
                </div>
            )}
        </div>
    );
}

export default EntityList;
