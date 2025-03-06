// src/components/features/grants/GrantsList.tsx
import React, { useState, useMemo } from "react";
import { Calendar, DollarSign } from "lucide-react";
import { ResearchGrant } from "@/types/models";
import { GrantCard } from "./GrantCard";
import { UseInfiniteQueryResult } from "@tanstack/react-query";
import EntityList, { SortConfig } from "@/components/common/ui/EntityList";
import TrendVisualizer, {
    ViewContext,
} from "@/components/features/visualizations/TrendVisualizer";

export type GrantSortField = "date" | "value";
export type SortDirection = "asc" | "desc";

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
        city?: string;
        province?: string;
        country?: string;
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

    // Define sort options
    const sortOptions = [
        { field: "date", label: "Date", icon: Calendar },
        { field: "value", label: "Value", icon: DollarSign },
    ];

    // Handle local sorting for direct data mode
    const handleSortChange = (newSortConfig: SortConfig) => {
        setSortConfig(newSortConfig);

        // If consumer provided an onSortChange callback, call it
        if (onSortChange) {
            onSortChange(newSortConfig);
        }
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
        return allGrants.map((grant) => {
            // Start with the grant as returned from the API
            const processedGrant = { ...grant };

            // Only fill in missing critical data as a fallback safety measure
            // This should rarely or never be needed with the consolidated API
            if (!processedGrant.city && contextData.city)
                processedGrant.city = contextData.city;

            if (!processedGrant.province && contextData.province)
                processedGrant.province = contextData.province;

            if (!processedGrant.country && contextData.country)
                processedGrant.country = contextData.country;

            // These should be extremely rare cases now that we have the consolidated procedure
            if (!processedGrant.legal_name && contextData.recipientName) {
                processedGrant.legal_name = contextData.recipientName;
                if (contextData.recipientId)
                    processedGrant.recipient_id = Number(
                        contextData.recipientId
                    );
            }

            if (
                !processedGrant.research_organization_name &&
                contextData.instituteName
            ) {
                processedGrant.research_organization_name =
                    contextData.instituteName;
                if (contextData.instituteId)
                    processedGrant.institute_id = Number(
                        contextData.instituteId
                    );
            }

            return processedGrant;
        });
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

    // Render grant item
    const renderGrantItem = (grant: ResearchGrant) => (
        <GrantCard
            grant={grant}
            onBookmark={
                onBookmark ? () => onBookmark(grant.ref_number) : undefined
            }
        />
    );

    // Key extractor for grants
    const keyExtractor = (grant: ResearchGrant) =>
        `grant-${grant.grant_id || grant.ref_number}`;

    // Visualization component
    const visualization = showVisualization && (
        <TrendVisualizer
            grants={getAllGrants}
            viewContext={viewContext}
            height={350}
        />
    );

    return (
        <EntityList
            title={title}
            items={sortedGrantsToDisplay}
            renderItem={renderGrantItem}
            keyExtractor={keyExtractor}
            emptyMessage={emptyMessage}
            sortOptions={sortOptions}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
            infiniteQuery={infiniteQuery}
            totalCount={totalCount}
            totalItems={getAllGrants.length}
            visualization={visualization}
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
