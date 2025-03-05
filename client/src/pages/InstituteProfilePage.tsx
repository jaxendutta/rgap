// src/pages/InstituteProfilePage.tsx
import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { BookMarked, GraduationCap, PieChart } from "lucide-react";
import { useInstituteDetails } from "@/hooks/api/useInstitutes";
import { useInfiniteInstituteGrants } from "@/hooks/api/useInfiniteInstituteData";
import EntityProfilePage from "@/components/common/pages/EntityProfilePage";
import InstituteHeader from "@/components/features/institutes/InstituteHeader";
import InstituteStats from "@/components/features/institutes/InstituteStats";
import { RecipientsList } from "@/components/features/recipients/RecipientsList";
import GrantsList from "@/components/features/grants/GrantsList";
import { SortConfig } from "@/components/common/ui/EntityList";
import { AnalyticsCards } from "@/components/features/recipients/AnalyticsCards";
import { formatCurrency } from "@/utils/format";
import { getCategoryColor } from "@/utils/chartColors";
import { DollarSign } from "lucide-react";

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

    // Use the API hook to fetch institute basic details
    const {
        data: instituteData,
        isLoading,
        isError,
        error,
    } = useInstituteDetails(id || "");

    // Set up infinite query for grants with sorting
    const infiniteGrantsQuery = useInfiniteInstituteGrants(
        id || "",
        15, // pageSize
        grantsSortConfig.field as "date" | "value",
        grantsSortConfig.direction
    );

    const institute = instituteData?.data;

    // If institute not found and not loading
    if (!isLoading && !institute && !isError) {
        return <Navigate to="/pageNotFound" />;
    }

    // Get all agencies from funding history for legend and charts
    const agencies = institute?.funding_history
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
            label: "Detailed Analytics",
            icon: PieChart,
        },
    ];

    // Render functions for EntityProfilePage
    const renderHeader = (
        isBookmarked: boolean,
        toggleBookmark: () => void
    ) => {
        if (!institute) return null;
        return (
            <InstituteHeader
                institute={institute}
                isBookmarked={isBookmarked}
                toggleBookmark={toggleBookmark}
            />
        );
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

    const renderTabContent = (activeTabId: string) => {
        if (!institute) return null;

        switch (activeTabId) {
            case "recipients":
                return (
                    <RecipientsList
                        instituteId={id || ""}
                        initialPageSize={15}
                    />
                );

            case "grants":
                return (
                    <GrantsList
                        infiniteQuery={infiniteGrantsQuery}
                        title="Grants"
                        initialSortConfig={grantsSortConfig}
                        contextData={{
                            instituteName: institute.name,
                            instituteId: id,
                            city: institute.city,
                            province: institute.province,
                            country: institute.country,
                        }}
                        emptyMessage="This institute has no associated grants in our database."
                        showVisualization={true}
                        visualizationInitiallyVisible={true}
                        viewContext="institute"
                    />
                );

            case "analytics":
                // More detailed analytics that might still be useful
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">
                            Detailed Analytics
                        </h2>

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
                                            institute.total_funding > 0
                                                ? (agencyTotal /
                                                      institute.total_funding) *
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
                                                        institute.total_funding) *
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
                                                    (recipient) => {
                                                        const hasRecentGrant =
                                                            institute.grants.some(
                                                                (grant) =>
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
                                                        (grant) => {
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

                                                const avgDuration =
                                                    durations.reduce(
                                                        (sum, d) => sum + d,
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
                                                institute.total_grants &&
                                                institute.total_recipients
                                                    ? (
                                                          institute.total_grants /
                                                          institute.total_recipients
                                                      ).toFixed(1)
                                                    : "N/A",
                                        },
                                        {
                                            label: "Success Rate",
                                            value: "N/A", // Would need additional data to calculate
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
