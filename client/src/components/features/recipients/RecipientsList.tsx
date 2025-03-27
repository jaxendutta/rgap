// src/components/features/recipients/RecipientsList.tsx
import { useState, useMemo } from "react";
import { DollarSign, Users } from "lucide-react";
import { useInfiniteInstituteRecipients } from "@/hooks/api/useInstitutes";
import EntityList from "@/components/common/ui/EntityList";
import { SortConfig } from "@/types/search";
import { TrendVisualizer } from "@/components/features/visualizations/TrendVisualizer";
import RecipientCard from "./RecipientCard";
import { Recipient } from "@/types/models";

interface RecipientsListProps {
    instituteId: string | number;
    initialPageSize?: number;
    showVisualization?: boolean;
    visualizationInitiallyVisible?: boolean;
}

export const RecipientsList = ({
    instituteId,
    initialPageSize = 10,
    showVisualization = true,
    visualizationInitiallyVisible = false,
}: RecipientsListProps) => {
    // State for sorting
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: "total_funding",
        direction: "desc",
    });

    // State for visualization
    const [isVisualizationVisible, setIsVisualizationVisible] = useState(
        visualizationInitiallyVisible
    );

    // Define sort options
    const sortOptions = [
        { field: "total_funding", label: "Funding", icon: DollarSign },
        { field: "grant_count", label: "Grants", icon: Users },
    ];

    // Fetch data with infinite query
    const infiniteQuery = useInfiniteInstituteRecipients(
        instituteId,
        initialPageSize,
        sortConfig.field as "total_funding" | "grant_count",
        sortConfig.direction
    );

    // Extract recipients from the query data
    const recipients = useMemo(() => {
        if (!infiniteQuery.data) return [];

        return infiniteQuery.data.pages.flatMap((page) => page.data);
    }, [infiniteQuery.data]);

    // Get total count
    const totalCount =
        infiniteQuery.data?.pages[0]?.metadata?.totalCount || recipients.length;

    // Transform recipient data into a format suitable for visualization
    const transformedData = useMemo(() => {
        if (!recipients || recipients.length === 0) return [];

        // Extract and transform data for visualization
        // Group recipients by various attributes
        const recipientData = recipients.map((recipient) => ({
            ...recipient,
            // Ensure we have proper data types
            grant_count: Number(recipient.grant_count) || 0,
            total_funding: Number(recipient.total_funding) || 0,
            // Add required properties for the visualizer
            recipient_id: recipient.recipient_id,
            legal_name: recipient.legal_name,
            // Add dummy agreement dates for visualization purposes
            agreement_start_date:
                recipient.latest_grant_date || new Date().toISOString(),
            agreement_value: recipient.total_funding,
            org: "Institute Recipient", // This could be replaced with actual org if available
        }));

        return recipientData;
    }, [recipients]);

    // Render recipient using the RecipientCard component
    const renderRecipientItem = (recipient: Recipient) => {
        // Log the recipient object to debug
        console.log("Rendering recipient:", recipient);
        return (
            <RecipientCard
                recipient={recipient}
                className="hover:border-gray-300 transition-all"
            />
        );
    };

    // Key extractor
    const keyExtractor = (recipient: any) =>
        `recipient-${recipient.recipient_id}`;

    // Visualization component
    const visualization = useMemo(() => {
        if (!showVisualization || transformedData.length === 0) return null;

        return (
            <TrendVisualizer
                grants={transformedData}
                viewContext="institute"
                height={350}
                initialGrouping="recipient"
                initialMetricType="funding"
                initialChartType="bar-stacked"
                availableGroupings={["recipient"]}
            />
        );
    }, [showVisualization, transformedData]);

    return (
        <EntityList
            entityType={"recipient"}
            entities={recipients}
            renderItem={renderRecipientItem}
            keyExtractor={keyExtractor}
            emptyMessage="This institute has no associated recipients in our database."
            sortOptions={sortOptions}
            sortConfig={sortConfig}
            onSortChange={setSortConfig}
            infiniteQuery={infiniteQuery}
            totalCount={totalCount}
            totalItems={recipients.length}
            visualization={visualization}
            visualizationToggle={
                showVisualization
                    ? {
                          isVisible: isVisualizationVisible,
                          toggle: () =>
                              setIsVisualizationVisible(
                                  !isVisualizationVisible
                              ),
                          showToggleButton: true,
                      }
                    : undefined
            }
        />
    );
};

export default RecipientsList;
