// src/pages/InstituteProfilePage.tsx
import { useState, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { UseInfiniteQueryResult } from "@tanstack/react-query";
import {
    BookMarked,
    GraduationCap,
    PieChart,
    DollarSign,
    Calendar,
    University,
    CircleArrowOutUpRight,
} from "lucide-react";
import {
    useEntityById,
    useEntityGrants,
    useAllEntityGrants,
    useInstituteRecipients,
    useAllInstituteRecipients,
    getDataFromResult,
    getTotalFromResult,
} from "@/hooks/api/useData";
import EntityProfilePage from "@/components/common/pages/EntityProfilePage";
import EntityList from "@/components/common/ui/EntityList";
import GrantsList from "@/components/features/grants/GrantsList";
import { SortConfig } from "@/types/search";
import EntityCard from "@/components/common/ui/EntityCard";
import { EntityAnalyticsSection } from "@/components/features/analytics/EntityAnalytics";
import TrendVisualizer from "@/components/features/visualizations/TrendVisualizer";
import StatDisplay from "@/components/common/ui/StatDisplay";
import EntityHeader, {
    ActionButton,
} from "@/components/common/layout/EntityHeader";
import { formatCommaSeparated } from "@/utils/format";

const InstituteProfilePage = () => {
    const { id } = useParams();
    const instituteId = Number(id);
    if (isNaN(instituteId)) {
        return <Navigate to="/pageNotFound" />;
    }

    // Component state
    const [activeTab, setActiveTab] = useState<
        "recipients" | "grants" | "analytics"
    >("recipients");
    const [expandedStats, setExpandedStats] = useState(false);
    const [grantsSortConfig] = useState<SortConfig>({
        field: "date",
        direction: "desc",
    });
    const [recipientsSortConfig, setRecipientsSortConfig] =
        useState<SortConfig>({
            field: "total_funding",
            direction: "desc",
        });
    const [showVisualization] = useState(true);
    const [isVisualizationVisible, setIsVisualizationVisible] = useState(true);
    const [doNotShowVisualizationToggle] = useState(false);

    // Use the useEntityById hook for institute details
    const instituteDetailsQuery = useEntityById("institute", id);
    const isLoading = instituteDetailsQuery.isLoading;
    const isError = instituteDetailsQuery.isError;
    const error = instituteDetailsQuery.error;
    const institute = (instituteDetailsQuery.data as { data: any })?.data;

    // Use useEntityGrants hook for institute grants with infinite query (for pagination in UI)
    const instituteGrantsQuery: UseInfiniteQueryResult<any, Error> =
        useEntityGrants("institute", id, {
            queryType: "infinite",
            sort: grantsSortConfig,
        });

    // Use useAllEntityGrants hook to get ALL grants for analytics (no pagination)
    const allGrantsQuery = useAllEntityGrants("institute", id);

    // Use useInstituteRecipients hook for institute recipients (paginated for UI)
    const instituteRecipientsQuery = useInstituteRecipients(id, {
        queryType: "infinite",
        sort: recipientsSortConfig,
    }) as UseInfiniteQueryResult<any, Error>;

    // Use useAllInstituteRecipients hook to get ALL recipients for analytics (no pagination)
    const allRecipientsQuery = useAllInstituteRecipients(id);

    // If institute not found and not loading
    if (!isLoading && !institute && !isError) {
        return <Navigate to="/pageNotFound" />;
    }

    // Extract all grants from query for analytics
    const allGrants = useMemo(() => {
        return allGrantsQuery.data || [];
    }, [allGrantsQuery.data]);

    // Extract all recipients from query for analytics
    const allRecipients = useMemo(() => {
        return allRecipientsQuery.data || [];
    }, [allRecipientsQuery.data]);

    // Get all agencies from funding history for analytics
    const agencies: string[] = useMemo(() => {
        if (!institute?.funding_history) return [];

        return Array.from(
            new Set(
                institute.funding_history.flatMap((entry: any) =>
                    Object.keys(entry).filter((key) => key !== "year")
                )
            )
        );
    }, [institute?.funding_history]);

    // Extract paginated recipients for the UI
    const paginatedRecipients = useMemo(() => {
        return getDataFromResult(instituteRecipientsQuery);
    }, [instituteRecipientsQuery.data]);

    // Define tabs for the TabNavigation component
    const tabs = [
        {
            id: "recipients",
            label: "Recipients",
            icon: GraduationCap,
        },
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

    const actions: ActionButton[] = [
        {
            icon: CircleArrowOutUpRight,
            label: "Look up",
            onClick: () =>
                window.open(
                    `https://www.google.com/search?q=${encodeURIComponent(
                        institute.name
                    )}`,
                    "_blank",
                    "noopener,noreferrer"
                ),
            variant: "outline",
        },
    ];

    // Render functions for EntityProfilePage
    const renderHeader = () => {
        if (!institute) return null;
        return (
            <EntityHeader
                title={institute.name}
                icon={University}
                metadata={[]}
                actions={actions}
                entityType="institute"
                entityId={institute.institute_id}
                isBookmarked={institute.is_bookmarked}
                location={formatCommaSeparated([
                    institute.city,
                    institute.province,
                    institute.country,
                ])}
            />
        );
    };

    const activePeriod =
        institute?.first_grant_date && institute?.latest_grant_date
            ? `${new Date(
                  institute.first_grant_date
              ).getFullYear()} - ${new Date(
                  institute.latest_grant_date
              ).getFullYear()}`
            : "N/A";

    // Create primary stats (always visible)
    const primaryStats = [
        {
            icon: GraduationCap,
            label: "Recipients",
            value: (institute?.total_recipients || 0).toLocaleString(),
        },
        {
            icon: BookMarked,
            label: "Total Grants",
            value: (institute?.total_grants || 0).toLocaleString(),
        },
        {
            icon: DollarSign,
            label: "Total Funding",
            value: institute?.total_funding.toLocaleString(),
        },
        {
            icon: Calendar,
            label: "Active Period",
            value: activePeriod,
        },
    ];

    const renderStats = () => {
        if (!institute) return null;
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

    // Render functions for recipient items
    const renderRecipientItem = (recipient: any) => {
        return (
            <EntityCard
                entity={recipient}
                entityType="recipient"
                className="hover:border-gray-300 transition-all h-full"
            />
        );
    };

    // Key extractor for recipients
    const keyExtractor = (recipient: any) =>
        `recipient-${recipient.recipient_id}`;

    const renderTabContent = (activeTabId: string) => {
        if (!institute) return null;

        switch (activeTabId) {
            case "recipients":
                // Define sort options for recipients
                const sortOptions = [
                    {
                        field: "total_funding",
                        label: "Funding",
                        icon: DollarSign,
                    },
                    { field: "grant_count", label: "Grants", icon: BookMarked },
                ];

                return (
                    <EntityList
                        entityType="recipient"
                        entities={paginatedRecipients}
                        renderItem={renderRecipientItem}
                        keyExtractor={keyExtractor}
                        variant="grid"
                        sortOptions={sortOptions}
                        sortConfig={recipientsSortConfig}
                        onSortChange={setRecipientsSortConfig}
                        infiniteQuery={instituteRecipientsQuery}
                        totalCount={getTotalFromResult(
                            instituteRecipientsQuery
                        )}
                        totalItems={paginatedRecipients.length}
                        emptyMessage="This institute has no associated recipients in our database."
                        allowLayoutToggle={true}
                        visualization={
                            showVisualization ? (
                                <TrendVisualizer
                                    grants={allGrants}
                                    entityType="recipient"
                                    viewContext="institute"
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
                                      showToggleButton:
                                          !doNotShowVisualizationToggle,
                                  }
                                : undefined
                        }
                    />
                );

            case "grants":
                return (
                    <GrantsList
                        grants={allGrants}
                        infiniteQuery={instituteGrantsQuery}
                        initialSortConfig={grantsSortConfig}
                        emptyMessage="This institute has no associated grants in our database."
                        showVisualization={true}
                        viewContext="institute"
                    />
                );

            case "analytics":
                // Pass all data (not paginated) to analytics components
                const analyticsLoading =
                    allGrantsQuery.isLoading || allRecipientsQuery.isLoading;

                if (analyticsLoading) {
                    return (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-500">
                                Loading complete analytics data...
                            </p>
                        </div>
                    );
                }

                return (
                    <EntityAnalyticsSection
                        entityType="institute"
                        entity={institute}
                        grants={allGrants}
                        recipients={allRecipients}
                        agencies={agencies}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <EntityProfilePage
            entity={institute}
            entityType="institute"
            entityTypeLabel="Institute"
            isLoading={isLoading}
            isError={isError}
            error={error}
            renderHeader={renderHeader}
            renderStats={renderStats}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) =>
                setActiveTab(tabId as "recipients" | "grants" | "analytics")
            }
            renderTabContent={renderTabContent}
        />
    );
};

export default InstituteProfilePage;
