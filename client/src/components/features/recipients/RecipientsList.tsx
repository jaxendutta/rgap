// src/components/features/recipients/RecipientsList.tsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { DollarSign, BookMarked, Users, GraduationCap } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { Card } from "@/components/common/ui/Card";
import { useInfiniteInstituteRecipients } from "@/hooks/api/useInstitutes";
import EntityList, { SortConfig } from "@/components/common/ui/EntityList";
import { TrendVisualizer } from "@/components/features/visualizations/TrendVisualizer";

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
        { field: "grants_count", label: "Grants", icon: Users },
    ];

    // Fetch data with infinite query
    const infiniteQuery = useInfiniteInstituteRecipients(
        instituteId,
        initialPageSize,
        sortConfig.field as "total_funding" | "grants_count",
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
        const recipientData = recipients.map(recipient => ({
            ...recipient,
            // Ensure we have proper data types
            grants_count: Number(recipient.grants_count) || 0,
            total_funding: Number(recipient.total_funding) || 0,
            // Add required properties for the visualizer
            recipient_id: recipient.recipient_id,
            legal_name: recipient.legal_name,
            // Add dummy agreement dates for visualization purposes
            agreement_start_date: recipient.latest_grant_date || new Date().toISOString(),
            agreement_value: recipient.total_funding,
            org: "Institute Recipient" // This could be replaced with actual org if available
        }));

        return recipientData;
    }, [recipients]);

    // Render recipient card
    const renderRecipientItem = (recipient: any) => (
        <Card className="p-4 hover:border-gray-300 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                <div className="space-y-1">
                    <Link
                        to={`/recipients/${recipient.recipient_id}`}
                        className="text-lg font-medium hover:text-blue-600 transition-colors flex items-center"
                    >
                        <GraduationCap className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        {recipient.legal_name}
                    </Link>
                    <div className="text-sm text-gray-500 flex items-center">
                        <BookMarked className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        {recipient.grants_count} grants
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-medium text-lg flex items-center justify-end">
                        <DollarSign className="h-4 w-4 mr-1 flex-shrink-0" />
                        {formatCurrency(recipient.total_funding)}
                    </div>
                </div>
            </div>
        </Card>
    );

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
            title="Recipients"
            items={recipients}
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
                          toggle: () => setIsVisualizationVisible(!isVisualizationVisible),
                          showToggleButton: true,
                      }
                    : undefined
            }
        />
    );
};