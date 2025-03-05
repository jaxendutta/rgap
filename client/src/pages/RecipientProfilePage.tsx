// src/pages/RecipientProfilePage.tsx
import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { BookMarked, PieChart, DollarSign } from "lucide-react";
import { useRecipientDetails } from "@/hooks/api/useRecipients";
import EntityProfilePage from "@/components/common/pages/EntityProfilePage";
import RecipientHeader from "@/components/features/recipients/RecipientHeader";
import RecipientStats from "@/components/features/recipients/RecipientStats";
import GrantsList from "@/components/features/grants/GrantsList";
import { SortConfig } from "@/components/common/ui/EntityList";
import { AnalyticsCards } from "@/components/features/recipients/AnalyticsCards";
import { formatCurrency } from "@/utils/format";
import { getCategoryColor } from "@/utils/chartColors";

export const RecipientProfilePage = () => {
    const { id } = useParams();

    // Use the API hook to fetch recipient details
    const {
        data: recipientData,
        isLoading,
        isError,
        error,
    } = useRecipientDetails(id || "");

    const recipient = recipientData?.data;

    // Component state
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: "date",
        direction: "desc",
    });
    const [activeTab, setActiveTab] = useState<"grants" | "analytics">(
        "grants"
    );
    const [expandedStats, setExpandedStats] = useState(false);

    // If recipient not found and not loading
    if (!isLoading && !recipient && !isError) {
        return <Navigate to="/pageNotFound" />;
    }

    // Get all agencies from funding history for legend
    const agencies = recipient?.funding_history
        ? Array.from(
              new Set(
                  recipient.funding_history.flatMap((entry: any) =>
                      Object.keys(entry).filter((key) => key !== "year")
                  )
              )
          )
        : [];

    // Calculate stats for the profile overview
    const totalFunding = recipient?.total_funding || 0;

    // Define tabs for the TabNavigation component
    const tabs = [
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
        if (!recipient) return null;
        return (
            <RecipientHeader
                recipient={recipient}
                isBookmarked={isBookmarked}
                toggleBookmark={toggleBookmark}
            />
        );
    };

    const renderStats = () => {
        if (!recipient) return null;
        return (
            <RecipientStats
                recipient={recipient}
                processedGrants={recipient.grants || []}
                agencies={agencies}
                expandedStats={expandedStats}
                setExpandedStats={setExpandedStats}
            />
        );
    };

    const renderTabContent = (activeTabId: string) => {
        if (!recipient) return null;

        switch (activeTabId) {
            case "grants":
                return (
                    <GrantsList
                        grants={recipient.grants || []}
                        onSortChange={setSortConfig}
                        initialSortConfig={sortConfig}
                        title="Grants"
                        contextData={{
                            recipientName: recipient.legal_name,
                            recipientId: recipient.recipient_id,
                            instituteName: recipient.research_organization_name,
                            instituteId: recipient.institute_id,
                            city: recipient.city,
                            province: recipient.province,
                            country: recipient.country,
                        }}
                        emptyMessage="This recipient has no associated grants in our database."
                        showVisualization={true}
                        visualizationInitiallyVisible={true}
                        viewContext="recipient"
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
                                        const agencyTotal = recipient.grants
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
                                            totalFunding > 0
                                                ? (agencyTotal / totalFunding) *
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
                                // Additional detailed analytics cards
                                {
                                    title: "Time-based Analysis",
                                    icon: (
                                        <PieChart className="h-4 w-4 mr-1.5 text-blue-600" />
                                    ),
                                    fields: [
                                        {
                                            label: "Average Grant Duration",
                                            value: (() => {
                                                if (
                                                    recipient.grants.length ===
                                                    0
                                                )
                                                    return "N/A";

                                                const durations =
                                                    recipient.grants.map(
                                                        (grant: any) => {
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
                                            label: "Most Active Year",
                                            value: (() => {
                                                if (
                                                    recipient.grants.length ===
                                                    0
                                                )
                                                    return "N/A";

                                                const yearCounts: Record<
                                                    number,
                                                    number
                                                > = {};
                                                recipient.grants.forEach(
                                                    (grant: any) => {
                                                        const year = new Date(
                                                            grant.agreement_start_date
                                                        ).getFullYear();
                                                        yearCounts[year] =
                                                            (yearCounts[year] ||
                                                                0) + 1;
                                                    }
                                                );

                                                let maxYear = 0;
                                                let maxCount = 0;
                                                Object.entries(
                                                    yearCounts
                                                ).forEach(([year, count]) => {
                                                    if (count > maxCount) {
                                                        maxYear =
                                                            parseInt(year);
                                                        maxCount =
                                                            count as number;
                                                    }
                                                });

                                                return `${maxYear} (${maxCount} grants)`;
                                            })(),
                                        },
                                        {
                                            label: "Grant Size Trend",
                                            value: (() => {
                                                if (recipient.grants.length < 2)
                                                    return "Insufficient data";

                                                // Group by year and calculate average
                                                const yearlyAvg: Record<
                                                    number,
                                                    {
                                                        sum: number;
                                                        count: number;
                                                    }
                                                > = {};
                                                recipient.grants.forEach(
                                                    (grant: any) => {
                                                        const year = new Date(
                                                            grant.agreement_start_date
                                                        ).getFullYear();
                                                        if (!yearlyAvg[year])
                                                            yearlyAvg[year] = {
                                                                sum: 0,
                                                                count: 0,
                                                            };
                                                        yearlyAvg[year].sum +=
                                                            grant.agreement_value;
                                                        yearlyAvg[
                                                            year
                                                        ].count += 1;
                                                    }
                                                );

                                                // Convert to array of averages by year
                                                const averages = Object.entries(
                                                    yearlyAvg
                                                )
                                                    .sort(
                                                        ([a], [b]) =>
                                                            parseInt(a) -
                                                            parseInt(b)
                                                    )
                                                    .map(([year, data]) => ({
                                                        year: parseInt(year),
                                                        avg:
                                                            data.sum /
                                                            data.count,
                                                    }));

                                                // Check if trend is increasing or decreasing
                                                if (averages.length < 2)
                                                    return "Insufficient data";

                                                const firstAvg =
                                                    averages[0].avg;
                                                const lastAvg =
                                                    averages[
                                                        averages.length - 1
                                                    ].avg;

                                                if (lastAvg > firstAvg * 1.1)
                                                    return "Increasing";
                                                if (lastAvg < firstAvg * 0.9)
                                                    return "Decreasing";
                                                return "Stable";
                                            })(),
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
            entity={recipient}
            entityType="recipient"
            entityTypeLabel="Recipient"
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
