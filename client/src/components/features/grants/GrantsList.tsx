// src/components/features/grants/GrantsList.tsx
import React, { useState, useMemo } from "react";
import { Calendar, DollarSign } from "lucide-react";
import { Grant } from "@/types/models";
import { GrantCard } from "./GrantCard";
import { UseInfiniteQueryResult } from "@tanstack/react-query";
import EntityList from "@/components/common/ui/EntityList";
import { SortConfig } from "@/types/search";
import {
    TrendVisualizer,
    ViewContext,
} from "@/components/features/visualizations/TrendVisualizer";
export type GrantSortField = "date" | "value";
export type SortDirection = "asc" | "desc";

interface GrantsListProps {
    // Direct data mode
    grants?: Grant[];
    onSortChange?: (sortConfig: SortConfig) => void;

    // OR Infinite query mode
    infiniteQuery?: UseInfiniteQueryResult<any, Error>;

    // Common props
    initialSortConfig?: SortConfig;
    emptyMessage?: string;

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
    initialSortConfig = { field: "date", direction: "desc" },
    emptyMessage = "No grants found.",
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

    const handleSortChange = (newSortConfig: SortConfig) => {
        setSortConfig(newSortConfig);
        if (onSortChange) {
            onSortChange(newSortConfig);
        }
    };

    // Get all grants, not just the visible ones
    const getAllGrants = useMemo((): Grant[] => {
        // Infinite query mode - get ALL pages of data
        if (infiniteQuery?.data) {
            return infiniteQuery.data.pages.flatMap(
                (page: { data: Grant[] }) => page.data
            );
        }

        // Direct data mode
        if (grants) {
            return grants;
        }

        return [];
    }, [infiniteQuery?.data, grants]);

    return (
        <EntityList
            entityType="grant"
            entities={getAllGrants}
            renderItem={(grant: Grant) => <GrantCard grant={grant} />}
            keyExtractor={(grant: Grant, index: number) =>
                grant.grant_id || `grant-${index}`
            }
            emptyMessage={emptyMessage}
            sortOptions={[
                {
                    field: "agreement_start_date",
                    label: "Date",
                    icon: Calendar,
                },
                { field: "agreement_value", label: "Value", icon: DollarSign },
            ]}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
            infiniteQuery={infiniteQuery}
            totalCount={
                infiniteQuery?.data?.pages[0]?.metadata?.totalCount ||
                getAllGrants.length
            }
            totalItems={getAllGrants.length}
            visualization={
                <TrendVisualizer
                    grants={getAllGrants}
                    viewContext={viewContext}
                    height={350}
                />
            }
            visualizationToggle={
                showVisualization
                    ? {
                          isVisible: isVisualizationVisible,
                          toggle: () =>
                              setIsVisualizationVisible(
                                  !isVisualizationVisible
                              ),
                          showToggleButton: !doNotShowVisualizationToggle,
                      }
                    : undefined
            }
        />
    );
};

export default GrantsList;
