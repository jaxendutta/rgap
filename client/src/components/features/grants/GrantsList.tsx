// src/components/features/grants/GrantsList.tsx
import React, { useState, useMemo } from "react";
import { Calendar, DollarSign } from "lucide-react";
import { Grant } from "@/types/models";
import { GrantCard } from "./GrantCard";
import { UseInfiniteQueryResult } from "@tanstack/react-query";
import EntityList from "@/components/common/ui/EntityList";
import { SortConfig } from "@/types/search";
import { useSortGrant } from "@/hooks/api/useGrants";
import {
    TrendVisualizer,
    ViewContext,
} from "@/components/features/visualizations/TrendVisualizer";
import { prepareGrantsForVisualization } from "@/utils/chartDataTransforms";

export type GrantSortField = "date" | "value";
export type SortDirection = "asc" | "desc";

interface GrantsListProps {
    // Direct data mode
    grants?: Grant[];
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
    const [sortedGrants, setSortedGrants] = useState<Grant[]>([]);

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
    const sortQuery = useSortGrant(sortConfig, 1, 20);
    
    React.useEffect(() => {
        if (sortConfig) {
            console.log("🔵 触发 API 调用:", sortConfig);
            sortQuery.refetch().then((result) => {
                if (result.data) {
                    setSortedGrants(result.data); 
                }
            });
        }
    }, [sortConfig]);

    const handleSortChange = (newSortConfig: SortConfig) => {
            
        setSortConfig((prevConfig) => {
            // console.log("旧的 sortConfig:", prevConfig);
            // console.log("更新后的 sortConfig:", newSortConfig);
            return newSortConfig;
        });
        // If consumer provided an onSortChange callback, call it
        
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

    // Process grants with context data
    const getGrantsToDisplay = useMemo((): Grant[] => {
        const allGrants = getAllGrants;

        // Enrich grants with context data if needed
        return allGrants.map((grant) => {
            // Start with the grant as returned from the API
            const processedGrant = { ...grant };

            // Only fill in missing critical data as a fallback safety measure
            if (!processedGrant.city && contextData.city)
                processedGrant.city = contextData.city;

            if (!processedGrant.province && contextData.province)
                processedGrant.province = contextData.province;

            if (!processedGrant.country && contextData.country)
                processedGrant.country = contextData.country;

            // These should be extremely rare cases
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

            // Ensure program information is correctly formatted
            if (processedGrant.prog_title_en) {
                processedGrant.program_name = processedGrant.prog_title_en;
            }

            // Ensure numeric values are valid numbers
            processedGrant.agreement_value =
                Number(processedGrant.agreement_value) || 0;

            return processedGrant;
        });
    }, [getAllGrants, contextData]);

    // For direct data mode, sort the grants according to config
    /*
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
                // Sort by date
                const dateA = new Date(a.agreement_start_date).getTime();
                const dateB = new Date(b.agreement_start_date).getTime();
                return sortConfig.direction === "asc"
                    ? dateA - dateB
                    : dateB - dateA;
            }
        });
    }, [getGrantsToDisplay, infiniteQuery, sortConfig]);
    */
    const sortedGrantsToDisplay = useMemo(() => {
        return sortedGrants.length > 0 ? sortedGrants : getGrantsToDisplay;
    }, [sortedGrants, getGrantsToDisplay]);


    // Get total count for display
    const totalCount =
        infiniteQuery?.data?.pages[0]?.metadata?.totalCount ||
        sortedGrantsToDisplay.length;

    // Render grant item
    const renderGrantItem = (grant: Grant) => (
        <GrantCard
            grant={grant}
            onBookmark={
                onBookmark ? () => onBookmark(grant.ref_number) : undefined
            }
        />
    );

    // Key extractor for grants
    const keyExtractor = (grant: Grant) =>
        `grant-${grant.grant_id || grant.ref_number}`;

    // Visualization component - pass all available grant data, not just the visible ones
    // Use the prepareGrantsForVisualization function to ensure data quality
    const visualization = useMemo(() => {
        if (!showVisualization || getAllGrants.length === 0) return null;

        // Prepare and clean data for visualization
        const preparedGrants = prepareGrantsForVisualization(getAllGrants);

        // Determine appropriate available groupings based on context
        let availableGroupings: any[] = [];

        if (viewContext === "recipient") {
            availableGroupings = ["org", "program", "year"];
        } else if (viewContext === "institute") {
            availableGroupings = ["recipient", "org", "program", "year"];
        } else {
            availableGroupings = [
                "org",
                "city",
                "province",
                "country",
                "recipient",
                "institute",
            ];
        }

        return (
            <TrendVisualizer
                grants={preparedGrants}
                viewContext={viewContext}
                height={350}
                availableGroupings={availableGroupings}
            />
        );
    }, [showVisualization, getAllGrants, viewContext]);

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
