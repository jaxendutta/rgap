// Update src/pages/RecipientProfilePage.tsx
import { useState, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { UseInfiniteQueryResult } from "@tanstack/react-query";
import {
    BookMarked,
    Calendar,
    CircleArrowOutUpRight,
    DollarSign,
    FileUser,
    GraduationCap,
    PieChart,
    TrendingUp,
    University,
} from "lucide-react";
import {
    useAllEntityGrants,
    useEntityById,
    useEntityGrants,
} from "@/hooks/api/useData";
import EntityProfilePage from "@/components/common/pages/EntityProfilePage";
import { SortConfig } from "@/types/search";
import { EntityAnalyticsSection } from "@/components/features/analytics/EntityAnalytics";
import { extractAgenciesFromGrants } from "@/utils/analytics";
import StatDisplay, { StatItem } from "@/components/features/analytics/StatDisplay";
import { formatCommaSeparated, formatCurrency } from "@/utils/format";
import EntityHeader, {
    ActionButton,
    MetadataItem,
} from "@/components/common/layout/EntityHeader";
import { RecipientType } from "@/constants/data";
import { Entity, Grant } from "@/types/models";
import EntityList from "@/components/common/ui/EntityList";
import { GrantCard } from "@/components/features/grants/GrantCard";

const RecipientProfilePage = () => {
    const { id } = useParams();
    const recipientId = Number(id);
    if (isNaN(recipientId)) {
        return <Navigate to="/pageNotFound" />;
    }
    const entityType: keyof Entity = "recipient";

    // Component state
    const [activeTab, setActiveTab] = useState<"grants" | "analytics">(
        "grants"
    );
    const [expandedStats, setExpandedStats] = useState(false);
    const [grantsSortConfig] = useState<SortConfig<Grant>>({
        field: "agreement_start_date",
        direction: "desc",
    });

    // Use the useEntityById hook for recipient details
    const recipientDetailsQuery = useEntityById(entityType, id);
    const isLoading = recipientDetailsQuery.isLoading;
    const isError = recipientDetailsQuery.isError;
    const error = recipientDetailsQuery.error;
    const recipient = (recipientDetailsQuery.data as { data: any })?.data;

    // Use useEntityGrants hook for recipient grants with infinite query (for UI pagination)
    const recipientGrantsQuery = useEntityGrants(entityType, recipientId, {
        queryType: "infinite",
        sort: grantsSortConfig,
    }) as UseInfiniteQueryResult<any, Error>;

    // Use useAllEntityGrants hook to get ALL grants for analytics (no pagination)
    const allGrants = useAllEntityGrants(entityType, recipientId);

    // If recipient not found and not loading
    if (!isLoading && !recipient && !isError) {
        return <Navigate to="/pageNotFound" />;
    }

    // Extract agencies for analytics
    const agencies = useMemo(() => {
        return extractAgenciesFromGrants(allGrants);
    }, [allGrants]);

    // Define tabs for the TabNavigation component
    const tabs = [
        {
            id: "grants",
            label: "Grants",
            icon: BookMarked,
        },
        {
            id: "analytics",
            label: "Analytics",
            icon: PieChart,
        },
    ];

    // Metadata for the EntityHeader
    const metadata: MetadataItem[] = [];

    if (recipient?.research_organization_name) {
        metadata.push({
            icon: University,
            text: recipient.research_organization_name,
            href: `/institutes/${recipient.institute_id}`,
        });
    }

    metadata.push({
        icon: FileUser,
        text: recipient?.type
            ? RecipientType[recipient.type as keyof typeof RecipientType]
            : "Unspecified",
    });

    const actions: ActionButton[] = [
        {
            icon: CircleArrowOutUpRight,
            label: "Look up",
            onClick: () =>
                window.open(
                    `https://www.google.com/search?q=${encodeURIComponent(
                        `${recipient.legal_name} ${
                            recipient.research_organization_name || ""
                        }`
                    )}`,
                    "_blank",
                    "noopener,noreferrer"
                ),
            variant: "outline",
        },
    ];

    // Render functions for EntityProfilePage
    const renderHeader = () => {
        if (!recipient) return null;
        return (
            <EntityHeader
                title={recipient.legal_name}
                icon={GraduationCap}
                metadata={metadata}
                actions={actions}
                entityType={entityType as keyof Entity}
                entityId={recipient.recipient_id}
                isBookmarked={recipient.is_bookmarked}
                location={formatCommaSeparated([
                    recipient.city,
                    recipient.province,
                    recipient.country,
                ])}
            />
        );
    };

    // Primary stats for the recipient
    const primaryStats: StatItem[] = [
        {
            icon: BookMarked,
            label: "Total Grants",
            value: recipient?.total_grants,
        },
        {
            icon: DollarSign,
            label: "Total Funding",
            value: formatCurrency(recipient?.total_funding),
        },
        {
            icon: TrendingUp,
            label: "Average Grant",
            value: recipient?.total_grants
                ? formatCurrency(
                      recipient.total_funding / recipient.total_grants
                  )
                : "N/A",
        },
        {
            icon: Calendar,
            label: "Active Period",
            value:
                recipient?.first_grant_date && recipient?.latest_grant_date
                    ? `${new Date(
                          recipient.first_grant_date
                      ).getFullYear()} - ${new Date(
                          recipient.latest_grant_date
                      ).getFullYear()}`
                    : "N/A",
        },
    ];

    const renderStats = () => {
        if (!recipient) return null;
        return (
            <StatDisplay
                items={primaryStats}
                columns={4}
                layout="grid"
                expandable={true}
                expanded={expandedStats}
                onToggleExpand={() => setExpandedStats(!expandedStats)}
            />
        );
    };

    // Render the content for the active tab
    const renderTabContent = (activeTabId: string) => {
        if (!recipient) return null;

        switch (activeTabId) {
            case "grants":
                return (
                    <EntityList
                        entityType="grant"
                        entities={allGrants || []}
                        renderItem={(grant: Grant) => (
                            <GrantCard grant={grant} />
                        )}
                        emptyMessage={
                            "This recipient has no associated grants in our database."
                        }
                        query={recipientGrantsQuery}
                        viewContext={entityType}
                        entityId={recipientId}
                        showVisualization={true}
                        visualizationData={allGrants}
                    />
                );

            case "analytics":
                return (
                    <EntityAnalyticsSection
                        entityType={entityType}
                        entity={recipient}
                        grants={allGrants}
                        agencies={agencies}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <EntityProfilePage
            entity={recipient}
            entityType={entityType}
            isLoading={isLoading}
            isError={isError}
            error={error}
            renderHeader={renderHeader}
            renderStats={renderStats}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) =>
                setActiveTab(tabId as "grants" | "analytics")
            }
            renderTabContent={renderTabContent}
        />
    );
};

export default RecipientProfilePage;
