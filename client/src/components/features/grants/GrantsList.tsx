// src/components/features/grants/GrantsList.tsx (simplified)
import React, { useState, useMemo } from "react";
import { Calendar, DollarSign, LucideIcon } from "lucide-react";
import { Grant } from "@/types/models";
import { GrantCard } from "./GrantCard";
import { UseInfiniteQueryResult } from "@tanstack/react-query";
import EntityList from "@/components/common/ui/EntityList";
import { SortConfig } from "@/types/search";
import { TrendVisualizer } from "@/components/features/visualizations/TrendVisualizer";

interface GrantsListProps {
    // Complete data
    grants: Grant[];

    // Infinite query
    query?: UseInfiniteQueryResult<any, Error>;

    // Entity information for fetching all grants
    entityId?: number;
    entityType?: "recipient" | "institute";

    // Common props
    initialSortConfig?: SortConfig<Grant>;
    emptyMessage?: string;

    // Visualization props
    showVisualization?: boolean;
    visualizationInitiallyVisible?: boolean;
    viewContext?: "search" | "recipient" | "institute" | "custom";
    doNotShowVisualizationToggle?: boolean;
}

const GrantsList: React.FC<GrantsListProps> = ({
    grants,
    query,
    entityId,
    entityType,
    initialSortConfig = { field: "agreement_start_date", direction: "desc" },
    emptyMessage = "No grants found.",
    showVisualization = true,
    visualizationInitiallyVisible = false,
    viewContext = "search",
    doNotShowVisualizationToggle = false,
}) => {
    // State for visualization
    const [isVisualizationVisible, setIsVisualizationVisible] = useState(
        visualizationInitiallyVisible
    );

    // Process the initial sort config to make it suitable for display
    const displaySortConfig = useMemo(
        () => initialSortConfig,
        [initialSortConfig]
    );

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

    // Define sort options for EntityList
    const sortOptions: {
        field: keyof Grant;
        label: string;
        icon: LucideIcon;
    }[] = [
        {
            field: "agreement_start_date",
            label: "Date",
            icon: Calendar,
        },
        {
            field: "agreement_value",
            label: "Value",
            icon: DollarSign,
        },
    ];

    return (
        <EntityList
            entityType="grant"
            entities={getVisibleGrants}
            renderItem={(grant: Grant) => <GrantCard grant={grant} />}
            keyExtractor={(grant: Grant) => grant.grant_id}
            emptyMessage={emptyMessage}
            sortOptions={sortOptions}
            initialSortConfig={displaySortConfig}
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
