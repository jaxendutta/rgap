// src/components/features/grants/ImprovedGrantsList.tsx
import React, { useState, useMemo } from "react";
import { Calendar, DollarSign } from "lucide-react";
import { Grant } from "@/types/models";
import { GrantCard } from "./GrantCard";
import { UseInfiniteQueryResult } from "@tanstack/react-query";
import EntityList from "@/components/common/ui/EntityList";
import { SortConfig } from "@/types/search";
import { TrendVisualizer } from "@/components/features/visualizations/TrendVisualizer";

export type GrantSortField = "date" | "value";
export type SortDirection = "asc" | "desc";

interface GrantsListProps {
    // Direct data mode
    grants: Grant[];
    onSortChange?: (sortConfig: SortConfig) => void;

    // OR Infinite query mode
    query?: UseInfiniteQueryResult<any, Error>;

    // Entity information for fetching all grants
    entityId?: number;
    entityType?: "recipient" | "institute";

    // Common props
    initialSortConfig?: SortConfig;
    emptyMessage?: string;

    // Visualization props
    showVisualization?: boolean;
    visualizationInitiallyVisible?: boolean;
    viewContext?: "search" | "recipient" | "institute" | "custom";
    doNotShowVisualizationToggle?: boolean;
}

const GrantsList: React.FC<GrantsListProps> = ({
    grants,
    onSortChange,
    query,
    entityId,
    entityType,
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

    // Get grants for visualization from props or from the infinite query (all pages)
    const getVisibleGrants = useMemo((): Grant[] => {
        // Infinite query mode - get visible pages of data
        if (query?.data) {
            return query.data.pages.flatMap(
                (page: { data: Grant[] }) => page.data
            );
        }

        // Direct data mode
        if (grants) {
            return grants;
        }

        return [];
    }, [query?.data, grants]);

    return (
        <EntityList
            entityType="grant"
            entities={getVisibleGrants}
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
            query={query}
            totalCount={
                query?.data?.pages[0]?.metadata?.totalCount ||
                getVisibleGrants.length
            }
            totalItems={getVisibleGrants.length}
            visualization={
                showVisualization ? (
                    <TrendVisualizer
                        grants={grants}
                        entityId={entityId}
                        entityType={entityType}
                        viewContext={viewContext}
                        height={350}
                    />
                ) : undefined
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
