// src/pages/InstituteProfilePage.tsx
import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { UseInfiniteQueryResult } from "@tanstack/react-query";
import { BookMarked, GraduationCap, PieChart } from "lucide-react";
import {
    useEntityById,
    useEntityGrants,
    getDataFromResult,
    getTotalFromResult,
    useInstituteRecipients,
} from "@/hooks/api/useData";
import EntityProfilePage from "@/components/common/pages/EntityProfilePage";
import InstituteHeader from "@/components/features/institutes/InstituteHeader";
import InstituteStats from "@/components/features/institutes/InstituteStats";
import EntityList from "@/components/common/ui/EntityList";
import GrantsList from "@/components/features/grants/GrantsList";
import { SortConfig } from "@/types/search";
import { AnalyticsCards } from "@/components/common/ui/AnalyticsCards";
import { formatCurrency } from "@/utils/format";
import { getCategoryColor } from "@/utils/chartColors";
import { DollarSign } from "lucide-react";
import EntityCard from "@/components/common/ui/EntityCard";
import { TrendVisualizer } from "@/components/features/visualizations/TrendVisualizer";

const InstituteProfilePage = () => {
    const { id } = useParams();

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
    const [isVisualizationVisible, setIsVisualizationVisible] = useState(false);

    // Use the new useEntityById hook for institute details
    const instituteDetailsQuery = useEntityById("institute", id);
    const isLoading = instituteDetailsQuery.isLoading;
    const isError = instituteDetailsQuery.isError;
    const error = instituteDetailsQuery.error;
    const institute = (instituteDetailsQuery.data as { data: any })?.data;

    // Use new useEntityGrants hook for institute grants with infinite query
    // Add explicit type annotation to fix TypeScript error
    const instituteGrantsQuery: UseInfiniteQueryResult<any, Error> =
        useEntityGrants("institute", id, {
            queryType: "infinite",
            sort: grantsSortConfig,
        });

    // Use new useData hook for institute recipients
    const instituteRecipientsQuery = useInstituteRecipients(id, {
        queryType: "infinite",
        sort: recipientsSortConfig,
    }) as UseInfiniteQueryResult<any, Error>;

    // If institute not found and not loading
    if (!isLoading && !institute && !isError) {
        return <Navigate to="/pageNotFound" />;
    }

    // Get all agencies from funding history for legend and charts
    const agencies: string[] = institute?.funding_history
        ? Array.from(
              new Set(
                  institute.funding_history.flatMap((entry: any) =>
                      Object.keys(entry).filter((key) => key !== "year")
                  )
              )
          )
        : [];

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

    // Render functions for EntityProfilePage
    const renderHeader = () => {
        if (!institute) return null;
        return <InstituteHeader {...institute} />;
    };

    const renderStats = () => {
        if (!institute) return null;
        return (
            <InstituteStats
                institute={institute}
                processedGrants={institute.grants || []}
                recipients={institute.recipients || []}
                agencies={agencies}
                expandedStats={expandedStats}
                setExpandedStats={setExpandedStats}
            />
        );
    };

    // Get recipients data from query results
    // Add null checks to fix "property 'data' does not exist on type '{}'" error
    const recipients = instituteRecipientsQuery.data
        ? getDataFromResult(instituteRecipientsQuery)
        : [];
    const recipientsTotal = instituteRecipientsQuery.data
        ? getTotalFromResult(instituteRecipientsQuery)
        : 0;

    // Render functions for recipient items
    const renderRecipientItem = (recipient: any) => {
        return (
            <EntityCard
                entity={recipient}
                entityType="recipient"
                className="hover:border-gray-300 transition-all h-full"
                // isBookmarked now comes from recipient.is_bookmarked via API
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
                // Create visualization component for recipients
                const recipientsVisualization =
                    recipients.length > 0 ? (
                        <TrendVisualizer
                            grants={recipients.map((recipient) => ({
                                ...recipient,
                                // Add required properties for the visualizer
                                agreement_start_date:
                                    recipient.latest_grant_date ||
                                    new Date().toISOString(),
                                agreement_value: recipient.total_funding,
                                org: "Institute Recipient",
                            }))}
                            viewContext="institute"
                            height={350}
                            initialGrouping="recipient"
                            initialMetricType="funding"
                            initialChartType="bar-stacked"
                            availableGroupings={["recipient"]}
                        />
                    ) : null;

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
                        entities={recipients}
                        renderItem={renderRecipientItem}
                        keyExtractor={keyExtractor}
                        variant="grid"
                        sortOptions={sortOptions}
                        sortConfig={recipientsSortConfig}
                        onSortChange={setRecipientsSortConfig}
                        infiniteQuery={instituteRecipientsQuery}
                        totalCount={recipientsTotal}
                        totalItems={recipients.length}
                        emptyMessage="This institute has no associated recipients in our database."
                        visualization={recipientsVisualization}
                        visualizationToggle={{
                            isVisible: isVisualizationVisible,
                            toggle: () =>
                                setIsVisualizationVisible(
                                    !isVisualizationVisible
                                ),
                            showToggleButton: true,
                        }}
                        allowLayoutToggle={true}
                    />
                );

            case "grants":
                return (
                    <GrantsList
                        infiniteQuery={instituteGrantsQuery}
                        initialSortConfig={grantsSortConfig}
                        emptyMessage="This institute has no associated grants in our database."
                        showVisualization={true}
                        visualizationInitiallyVisible={false}
                        viewContext="institute"
                    />
                );

            case "analytics":
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Analytics</h2>

                        {/* Analytics cards for detailed metrics */}
                        <AnalyticsCards
                            cards={[
                                // Funding Breakdown card
                                {
                                    title: "Funding Breakdown by Agency",
                                    icon: (
                                        <DollarSign className="h-4 w-4 mr-1.5 text-blue-600" />
                                    ),
                                    fields: agencies.map((agency, index) => {
                                        const agencyTotal = institute.grants
                                            .filter(
                                                (grant: any) =>
                                                    grant.org === agency
                                            )
                                            .reduce(
                                                (sum: number, grant: any) =>
                                                    sum + grant.agreement_value,
                                                0
                                            );

                                        const percentage =
                                            (institute.total_funding ?? 0) > 0
                                                ? (agencyTotal /
                                                      (institute.total_funding ??
                                                          1)) *
                                                  100
                                                : 0;

                                        return {
                                            label: agency,
                                            icon: (
                                                <div
                                                    className="h-3.5 w-3.5 mr-1.5 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            getCategoryColor(
                                                                agency,
                                                                index
                                                            ),
                                                    }}
                                                />
                                            ),
                                            value: (
                                                <div className="text-right">
                                                    <div className="font-medium text-sm">
                                                        {formatCurrency(
                                                            agencyTotal
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {percentage.toFixed(1)}%
                                                    </div>
                                                </div>
                                            ),
                                        };
                                    }),
                                },
                                // Recipient Analysis card
                                {
                                    title: "Recipient Analysis",
                                    icon: (
                                        <GraduationCap className="h-4 w-4 mr-1.5 text-blue-600" />
                                    ),
                                    fields: [
                                        {
                                            label: "Top Recipient",
                                            value: (() => {
                                                if (
                                                    !institute.recipients ||
                                                    institute.recipients
                                                        .length === 0
                                                )
                                                    return "N/A";

                                                // Find recipient with most funding
                                                const topRecipient = [
                                                    ...institute.recipients,
                                                ].sort(
                                                    (a, b) =>
                                                        b.total_funding -
                                                        a.total_funding
                                                )[0];

                                                return topRecipient.legal_name;
                                            })(),
                                        },
                                        {
                                            label: "Recipient Concentration",
                                            value: (() => {
                                                if (
                                                    !institute.recipients ||
                                                    institute.recipients
                                                        .length === 0
                                                )
                                                    return "N/A";

                                                // Calculate what percentage of funding goes to top 3 recipients
                                                const sortedRecipients = [
                                                    ...institute.recipients,
                                                ].sort(
                                                    (a, b) =>
                                                        b.total_funding -
                                                        a.total_funding
                                                );

                                                const top3Funding =
                                                    sortedRecipients
                                                        .slice(0, 3)
                                                        .reduce(
                                                            (sum, r) =>
                                                                sum +
                                                                r.total_funding,
                                                            0
                                                        );

                                                const percentOfTotal =
                                                    (top3Funding /
                                                        (institute.total_funding ??
                                                            1)) *
                                                    100;
                                                return `${percentOfTotal.toFixed(
                                                    1
                                                )}% to top 3`;
                                            })(),
                                        },
                                        {
                                            label: "Active Recipients",
                                            value: (() => {
                                                if (!institute.recipients)
                                                    return "0";

                                                // Count recipients with recent grants (last 2 years)
                                                const twoYearsAgo = new Date();
                                                twoYearsAgo.setFullYear(
                                                    twoYearsAgo.getFullYear() -
                                                        2
                                                );

                                                let activeCount = 0;
                                                institute.recipients.forEach(
                                                    (recipient: {
                                                        recipient_id: number;
                                                    }) => {
                                                        const hasRecentGrant =
                                                            institute.grants.some(
                                                                (grant: {
                                                                    recipient_id: number;
                                                                    agreement_start_date: string;
                                                                }) =>
                                                                    grant.recipient_id ===
                                                                        recipient.recipient_id &&
                                                                    new Date(
                                                                        grant.agreement_start_date
                                                                    ) >=
                                                                        twoYearsAgo
                                                            );
                                                        if (hasRecentGrant)
                                                            activeCount++;
                                                    }
                                                );

                                                return `${activeCount} / ${institute.recipients.length}`;
                                            })(),
                                        },
                                    ],
                                },
                                // Grant Analysis card
                                {
                                    title: "Grant Analysis",
                                    icon: (
                                        <BookMarked className="h-4 w-4 mr-1.5 text-blue-600" />
                                    ),
                                    fields: [
                                        {
                                            label: "Avg Grant Duration",
                                            value: (() => {
                                                if (
                                                    !institute.grants ||
                                                    institute.grants.length ===
                                                        0
                                                )
                                                    return "N/A";

                                                const durations =
                                                    institute.grants.map(
                                                        (grant: {
                                                            agreement_start_date: Date;
                                                            agreement_end_date: Date;
                                                        }) => {
                                                            const start =
                                                                new Date(
                                                                    grant.agreement_start_date
                                                                );
                                                            const end =
                                                                new Date(
                                                                    grant.agreement_end_date
                                                                );
                                                            // Duration in months
                                                            return Math.round(
                                                                (end.getTime() -
                                                                    start.getTime()) /
                                                                    (1000 *
                                                                        60 *
                                                                        60 *
                                                                        24 *
                                                                        30)
                                                            );
                                                        }
                                                    );

                                                const avgDuration: number =
                                                    durations.reduce(
                                                        (
                                                            sum: number,
                                                            d: number
                                                        ) => sum + d,
                                                        0
                                                    ) / durations.length;
                                                return `${Math.round(
                                                    avgDuration
                                                )} months`;
                                            })(),
                                        },
                                        {
                                            label: "Grants per Recipient",
                                            value:
                                                institute.grant_count /
                                                institute.recipients.length,
                                        },
                                    ],
                                },
                            ]}
                        />
                    </div>
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
