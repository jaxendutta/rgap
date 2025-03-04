// src/components/features/grants/GrantsList.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import {
    Calendar,
    DollarSign,
    MoreHorizontal,
    LineChart,
    X,
} from "lucide-react";
import { ResearchGrant } from "@/types/models";
import { SortButton } from "@/components/common/ui/SortButton";
import { Button } from "@/components/common/ui/Button";
import { GrantCard } from "./GrantCard";
import LoadingState from "@/components/common/ui/LoadingState";
import EmptyState from "@/components/common/ui/EmptyState";
import ErrorState from "@/components/common/ui/ErrorState";
import { UseInfiniteQueryResult } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import TrendVisualizer, {
    ViewContext,
} from "@/components/features/visualizations/TrendVisualizer";

export type GrantSortField = "date" | "value";
export type SortDirection = "asc" | "desc";
export type SortConfig = {
    field: GrantSortField;
    direction: SortDirection;
};

interface GrantsListProps {
    // Direct data mode
    grants?: ResearchGrant[];
    onSortChange?: (sortConfig: SortConfig) => void;

    // OR Infinite query mode
    infiniteQuery?: UseInfiniteQueryResult<any, Error>;

    // Common props
    title?: string;
    initialSortConfig?: SortConfig;
    emptyMessage?: string;
    contextData?: {
        recipientName?: string;
        recipientId?: number | string;
        instituteName?: string;
        instituteId?: number | string;
    };
    onBookmark?: (grantId: string) => void;

    // Visualization props
    showVisualization?: boolean;
    visualizationInitiallyVisible?: boolean;
    viewContext?: ViewContext;
    doNotShowVisualizationToggle?: boolean;
}

const GrantsList: React.FC<GrantsListProps> = ({
    grants,
    onSortChange,
    infiniteQuery,
    title = "Grants",
    initialSortConfig = { field: "date", direction: "desc" },
    emptyMessage = "No grants found.",
    contextData = {},
    onBookmark,
    showVisualization = true,
    visualizationInitiallyVisible = false,
    viewContext = "search",
    doNotShowVisualizationToggle = false,
}) => {
    // Local sort state (used in direct data mode)
    const [sortConfig, setSortConfig] = useState<SortConfig>(initialSortConfig);

    // State for visualization
    const [isVisualizationVisible, setIsVisualizationVisible] = useState(
        visualizationInitiallyVisible
    );

    // Set up infinite scrolling with intersection observer
    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: "0px 0px 500px 0px", // Trigger 500px before reaching the end
    });

    // Handle infinite query mode loading states
    const isLoading = infiniteQuery?.isLoading;
    const isError = infiniteQuery?.isError;
    const error = infiniteQuery?.error;
    const isFetchingNextPage = infiniteQuery?.isFetchingNextPage;
    const hasNextPage = infiniteQuery?.hasNextPage;

    // Load more data when user scrolls to the bottom in infinite query mode
    useEffect(() => {
        if (inView && infiniteQuery && hasNextPage && !isFetchingNextPage) {
            infiniteQuery.fetchNextPage();
        }
    }, [inView, infiniteQuery, hasNextPage, isFetchingNextPage]);

    // Handle local sorting for direct data mode
    const handleSortChangeLocal = (field: GrantSortField) => {
        const newSortConfig = {
            field,
            direction:
                sortConfig.field === field && sortConfig.direction === "desc"
                    ? "asc"
                    : "desc",
        } as SortConfig;

        setSortConfig(newSortConfig);

        // If consumer provided an onSortChange callback, call it
        if (onSortChange) {
            onSortChange(newSortConfig);
        }
    };

    // Handle sort for infinite query mode
    const handleSortChangeInfinite = (field: GrantSortField) => {
        const newSortConfig = {
            field,
            direction:
                sortConfig.field === field && sortConfig.direction === "desc"
                    ? "asc"
                    : "desc",
        } as SortConfig;

        setSortConfig(newSortConfig);
    };

    // Get all grants, not just the visible ones
    const getAllGrants = useMemo((): ResearchGrant[] => {
        // Infinite query mode - get ALL pages of data
        if (infiniteQuery?.data) {
            return infiniteQuery.data.pages.flatMap(
                (page: { data: ResearchGrant[] }) => page.data
            );
        }

        // Direct data mode
        if (grants) {
            return grants;
        }

        return [];
    }, [infiniteQuery?.data, grants]);

    // Determine the grants to display based on the mode
    const getGrantsToDisplay = useMemo((): ResearchGrant[] => {
        const allGrants = getAllGrants;

        // Enrich grants with context data if needed
        return allGrants.map((grant) => ({
            ...grant,
            // Add recipient information if in institute context
            ...(contextData.recipientName && !grant.legal_name
                ? {
                      legal_name: contextData.recipientName,
                      recipient_id: contextData.recipientId
                          ? Number(contextData.recipientId)
                          : grant.recipient_id,
                  }
                : {}),
            // Add institute information if in recipient context
            ...(contextData.instituteName && !grant.research_organization_name
                ? {
                      research_organization_name: contextData.instituteName,
                      institute_id: contextData.instituteId
                          ? Number(contextData.instituteId)
                          : grant.institute_id,
                  }
                : {}),
        }));
    }, [getAllGrants, contextData]);

    // For direct data mode, sort the grants according to config
    const sortedGrantsToDisplay = useMemo(() => {
        if (infiniteQuery) {
            // In infinite query mode, the API handles sorting
            return getGrantsToDisplay;
        }

        // In direct data mode, we need to sort the grants
        return [...getGrantsToDisplay].sort((a, b) => {
            if (sortConfig.field === "value") {
                return sortConfig.direction === "asc"
                    ? a.agreement_value - b.agreement_value
                    : b.agreement_value - a.agreement_value;
            } else {
                return sortConfig.direction === "asc"
                    ? new Date(a.agreement_start_date).getTime() -
                          new Date(b.agreement_start_date).getTime()
                    : new Date(b.agreement_start_date).getTime() -
                          new Date(a.agreement_start_date).getTime();
            }
        });
    }, [getGrantsToDisplay, infiniteQuery, sortConfig]);

    // Get total count for display
    const totalCount =
        infiniteQuery?.data?.pages[0]?.metadata?.totalCount ||
        sortedGrantsToDisplay.length;

    // Handle error state
    if (isError && error) {
        return (
            <ErrorState
                title="Error Loading Grants"
                message={
                    error instanceof Error
                        ? error.message
                        : "Failed to load grants"
                }
                onRetry={() => infiniteQuery?.refetch()}
                size="md"
            />
        );
    }

    // Handle initial loading state
    if (isLoading && !sortedGrantsToDisplay.length) {
        return <LoadingState title="Loading Grants..." size="md" />;
    }

    // Handle empty state
    if (!isLoading && sortedGrantsToDisplay.length === 0) {
        return (
            <EmptyState
                title="No Grants Found"
                message={emptyMessage}
                size="md"
            />
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with sort controls and visualization toggle */}
            <div className="flex justify-between items-center border-b pb-2">
                <div className="flex flex-col lg:flex-row lg:items-center">
                    <div className="text-lg font-medium">{title}</div>
                    {totalCount > 0 && (
                        <span className="text-sm text-gray-500 lg:ml-2">
                            ({getAllGrants.length} out of {totalCount} results)
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <SortButton
                        label="Date"
                        icon={Calendar}
                        field="date"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onClick={() =>
                            infiniteQuery
                                ? handleSortChangeInfinite("date")
                                : handleSortChangeLocal("date")
                        }
                    />
                    <SortButton
                        label="Value"
                        icon={DollarSign}
                        field="value"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onClick={() =>
                            infiniteQuery
                                ? handleSortChangeInfinite("value")
                                : handleSortChangeLocal("value")
                        }
                    />
                    {showVisualization && !doNotShowVisualizationToggle && (
                        <Button
                            variant="outline"
                            size="sm"
                            icon={isVisualizationVisible ? X : LineChart}
                            onClick={() =>
                                setIsVisualizationVisible(
                                    !isVisualizationVisible
                                )
                            }
                            disabled={sortedGrantsToDisplay.length === 0}
                            className="lg:space-x-2"
                        >
                            <span className="hidden lg:inline">
                                {isVisualizationVisible
                                    ? "Hide Trends"
                                    : "Show Trends"}
                            </span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Visualization Section */}
            {showVisualization && (
                <AnimatePresence>
                    {isVisualizationVisible &&
                        sortedGrantsToDisplay.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 mb-6">
                                    <TrendVisualizer
                                        grants={getAllGrants}
                                        viewContext={viewContext}
                                        height={350}
                                    />
                                </div>
                            </motion.div>
                        )}
                </AnimatePresence>
            )}

            {/* Grants list */}
            <div className="space-y-4">
                {sortedGrantsToDisplay.map((grant) => (
                    <GrantCard
                        key={`grant-${grant.grant_id || grant.ref_number}`}
                        grant={grant}
                        onBookmark={
                            onBookmark
                                ? () => onBookmark(grant.ref_number)
                                : undefined
                        }
                    />
                ))}
            </div>

            {/* Loading indicator for infinite scroll */}
            {infiniteQuery && (
                <div ref={ref} className="flex justify-center py-4 h-16">
                    {isFetchingNextPage ? (
                        <LoadingState
                            title=""
                            message="Loading more grants..."
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
                    ) : sortedGrantsToDisplay.length > 0 ? (
                        <p className="text-sm text-gray-500">
                            All grants loaded
                        </p>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default GrantsList;
