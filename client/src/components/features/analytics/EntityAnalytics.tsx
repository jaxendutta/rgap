// src/components/features/analytics/EntityAnalytics.tsx
import React, { useState } from "react";
import { Grant, Institute, Recipient } from "@/types/models";
import { Card } from "@/components/common/ui/Card";
import { TrendVisualizer } from "@/components/features/visualizations/TrendVisualizer";
import {
    Activity,
    TrendingUp,
    TrendingDown,
    MoveRight,
    GraduationCap,
    University,
    BookMarked,
    Calendar,
    Users,
    CalendarDays,
} from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";
import {
    calculateFundingGrowth,
    calculateAgencySpecialization,
    calculateRecipientConcentration,
    calculateActiveRecipients,
    calculateAvgGrantDuration,
} from "@/utils/analytics";

// Reusable KPI Card component
export const KpiCard = ({
    title,
    value,
    icon,
}: {
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
}) => (
    <Card className="p-4">
        <div className="flex items-center mb-2">
            {icon}
            <h3 className="font-medium text-gray-800 ml-2">{title}</h3>
        </div>
        <div className="mt-1">{value}</div>
    </Card>
);

// Top Recipients Analysis component
export const TopRecipientsAnalysis = ({
    recipients,
    totalFunding,
}: {
    recipients: any[];
    totalFunding: number;
}) => {
    if (!recipients || recipients.length === 0) {
        return (
            <Card className="p-4">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                    Top Recipients
                </h3>
                <p className="text-gray-500">No recipient data available</p>
            </Card>
        );
    }

    // Get top 5 recipients by funding
    const topRecipients = [...recipients]
        .sort((a, b) => b.total_funding - a.total_funding)
        .slice(0, 5);

    return (
        <Card className="p-4">
            <h3 className="text-lg font-medium mb-4 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                Top Recipients
            </h3>

            <div className="space-y-4">
                {topRecipients.map((recipient, index) => {
                    const percentage =
                        (recipient.total_funding / totalFunding) * 100;

                    return (
                        <div
                            key={recipient.recipient_id}
                            className="flex items-center"
                        >
                            <div className="pl-2 pr-4 text-sm font-medium text-gray-500 flex-shrink-0 text-center">
                                #{index + 1}
                            </div>
                            <div className="w-48 md:w-64 text-sm overflow-hidden">
                                <a
                                    href={`/recipients/${recipient.recipient_id}`}
                                    className="text-blue-600 hover:underline font-medium truncate block"
                                >
                                    {recipient.legal_name}
                                </a>
                                <span className="text-xs text-gray-500 truncate block">
                                    {recipient.grant_count} grants
                                </span>
                            </div>
                            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden mx-3">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <div className="w-24 text-right text-sm font-medium">
                                {formatCurrency(recipient.total_funding)}
                            </div>
                            <div className="w-16 text-right text-sm text-gray-500">
                                {percentage.toFixed(1)}%
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

// Agency Breakdown component
export const AgencyBreakdown = ({
    grants,
    totalFunding,
}: {
    grants: any[];
    agencies: string[];
    totalFunding: number;
}) => {
    // Calculate funding by agency
    const agencyFunding: Record<string, number> = {};

    grants.forEach((grant) => {
        if (!agencyFunding[grant.org]) {
            agencyFunding[grant.org] = 0;
        }
        agencyFunding[grant.org] += Number(grant.agreement_value);
    });

    // Sort agencies by funding amount
    const sortedAgencies = Object.entries(agencyFunding)
        .sort((a, b) => b[1] - a[1])
        .map(([agency, funding]) => ({
            agency,
            funding,
            percentage: (funding / totalFunding) * 100,
        }));

    if (sortedAgencies.length === 0) {
        return null;
    }

    return (
        <Card className="p-5">
            <h3 className="text-lg font-medium mb-4 flex items-center">
                <University className="h-5 w-5 mr-2 text-blue-600" />
                Funding by Agency
            </h3>

            <div className="space-y-3">
                {sortedAgencies.map(({ agency, funding, percentage }) => (
                    <div key={agency} className="flex flex-col">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{agency}</span>
                            <span>{formatCurrency(funding)}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-blue-600"
                                style={{
                                    width: `${percentage}%`,
                                }}
                            ></div>
                        </div>
                        <div className="text-right text-xs text-gray-500 mt-1">
                            {percentage.toFixed(1)}%
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

// Advanced time-period analysis component
export const TimePeriodAnalytics: React.FC<{
    grants: Grant[];
    title?: string;
    periodType?: "yearly" | "quarterly" | "monthly";
}> = ({ grants, title = "Temporal Analysis", periodType = "yearly" }) => {
    if (!grants || grants.length === 0) {
        return (
            <Card className="p-5">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-blue-600" />
                    {title}
                </h3>
                <div className="text-gray-500">
                    No grant data available for temporal / funding analysis
                </div>
            </Card>
        );
    }

    // Group grants by time period
    const periodData = grants.reduce((acc, grant) => {
        const date = new Date(grant.agreement_start_date);
        let period: string;

        if (periodType === "yearly") {
            period = date.getFullYear().toString();
        } else if (periodType === "quarterly") {
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            period = `${date.getFullYear()} Q${quarter}`;
        } else {
            period = `${date.getFullYear()}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`;
        }

        if (!acc[period]) {
            acc[period] = {
                count: 0,
                total: 0,
                avg: 0,
                grants: [],
            };
        }

        acc[period].count += 1;
        acc[period].total += Number(grant.agreement_value) || 0;
        acc[period].grants.push(grant);

        return acc;
    }, {} as Record<string, { count: number; total: number; avg: number; grants: Grant[] }>);

    // Calculate averages
    Object.values(periodData).forEach((data) => {
        data.avg = data.total / data.count;
    });

    // Sort periods chronologically
    const sortedPeriods = Object.keys(periodData).sort();

    // Calculate year-over-year or period-over-period growth
    const growthData = sortedPeriods.map((period, index) => {
        if (index === 0) return { period, growth: null };

        const currentTotal = periodData[period].total;
        const previousTotal = periodData[sortedPeriods[index - 1]].total;

        const growth = previousTotal
            ? ((currentTotal - previousTotal) / previousTotal) * 100
            : null;

        return { period, growth };
    });

    return (
        <Card className="p-5">
            <h3 className="text-lg font-medium mb-4 flex items-center">
                <CalendarDays className="h-5 w-5 mr-2 text-blue-600" />
                {title}
            </h3>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            {[
                                "Period",
                                "Grants",
                                "Total Funding",
                                "Avg Grant",
                                "Growth",
                            ].map((header, index) => (
                                <th
                                    key={index}
                                    className={cn(
                                        "px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                        index === 0 ? "text-left" : "text-right"
                                    )}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedPeriods.map((period, index) => {
                            const data = periodData[period];
                            const growth = growthData[index].growth;

                            return (
                                <tr key={period} className="hover:bg-gray-50">
                                    {[
                                        period,
                                        data.count.toLocaleString(),
                                        formatCurrency(data.total),
                                        formatCurrency(data.avg),
                                        growth !== null ? (
                                            <span
                                                className={cn(
                                                    "inline-flex items-center justify-end",
                                                    growth > 0
                                                        ? "text-green-600"
                                                        : growth < 0
                                                        ? "text-red-600"
                                                        : "text-gray-500"
                                                )}
                                            >
                                                {growth > 0 ? "+" : ""}
                                                {growth.toFixed(1)}%
                                                {growth > 0 ? (
                                                    <TrendingUp className="h-3.5 w-3.5 ml-1" />
                                                ) : growth < 0 ? (
                                                    <TrendingDown className="h-3.5 w-3.5 ml-1" />
                                                ) : null}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">
                                                -
                                            </span>
                                        ),
                                    ].map((value, index) => (
                                        <td
                                            key={index}
                                            className={cn(
                                                "px-3 py-2 whitespace-nowrap text-sm",
                                                index === 0
                                                    ? "text-gray-900 font-medium"
                                                    : "text-gray-500 text-right"
                                            )}
                                        >
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

// Main analytics component that works for both institute and recipient entities
export const EntityAnalyticsSection = ({
    entityType,
    entity,
    grants,
    recipients = [],
    agencies = [],
}: {
    entityType: "institute" | "recipient";
    entity: Institute | Recipient;
    grants: Grant[];
    recipients?: any[];
    agencies?: string[];
}) => {
    // Initialize state for visualization settings
    const [chartMetric] = useState<"funding" | "count">("funding");
    const [chartType] = useState<"line" | "stacked" | "grouped">("line");

    // Compute analytics only once
    const fundingGrowth = calculateFundingGrowth(grants);
    const agencyAnalysis = calculateAgencySpecialization(grants);
    const grantDuration = calculateAvgGrantDuration(grants);

    // Calculate recipient metrics for institute view
    const recipientDiversity =
        entityType === "institute" && recipients.length > 0
            ? calculateRecipientConcentration(
                  recipients,
                  entity.total_funding || 0
              )
            : null;

    const activeRecipientsData =
        entityType === "institute" && recipients.length > 0
            ? calculateActiveRecipients(recipients, grants)
            : null;

    return (
        <div className="space-y-8">
            {/* Key Performance Metrics - summary of the most important stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* KPI 1: Funding Growth */}
                <KpiCard
                    title="Funding Growth"
                    value={
                        <div className="flex items-center">
                            <span
                                className={cn(
                                    fundingGrowth.percentChange > 0
                                        ? "text-green-600"
                                        : fundingGrowth.percentChange < 0
                                        ? "text-red-600"
                                        : "text-gray-500"
                                )}
                            >
                                {fundingGrowth.percentChange > 0 ? "+" : ""}
                                {fundingGrowth.percentChange.toFixed(1)}%
                                {(fundingGrowth.yearsSpan ?? 0) > 0
                                    ? ` over ${fundingGrowth.yearsSpan} years`
                                    : ""}
                                {Math.abs(fundingGrowth.percentChange) < 10 ? (
                                    <MoveRight className="h-4 w-4 ml-1 inline" />
                                ) : fundingGrowth.percentChange < 0 ? (
                                    <TrendingDown className="h-4 w-4 ml-1 inline" />
                                ) : (
                                    <TrendingUp className="h-4 w-4 ml-1 inline" />
                                )}
                            </span>
                        </div>
                    }
                    icon={<Activity className="h-5 w-5 text-blue-600" />}
                />

                {/* KPI 2: Entity-specific metric */}
                {entityType === "institute" ? (
                    <KpiCard
                        title="Recipient Diversity"
                        value={
                            <div>
                                <span>
                                    {recipientDiversity?.rating || "No data"}
                                </span>
                                {recipientDiversity && (
                                    <span className="block text-xs text-gray-600 mt-1">
                                        {`Top 3 recipients: 
                                        ${recipientDiversity.concentration.toFixed(
                                            1
                                        )}
                                        % of funding`}
                                    </span>
                                )}
                            </div>
                        }
                        icon={
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                        }
                    />
                ) : (
                    <KpiCard
                        title="Grant Duration"
                        value={
                            <div>
                                <span>{grantDuration.text}</span>
                                <span className="block text-xs text-gray-600 mt-1">
                                    Average across {grants.length} grants
                                </span>
                            </div>
                        }
                        icon={<Calendar className="h-5 w-5 text-blue-600" />}
                    />
                )}

                {/* KPI 3: Agency Distribution */}
                <KpiCard
                    title="Agency Distribution"
                    value={
                        <div>
                            <span>{agencyAnalysis.specialization}</span>
                            {agencyAnalysis.topAgency && (
                                <span className="block text-xs text-gray-600 mt-1">
                                    {agencyAnalysis.topAgency}:{" "}
                                    {agencyAnalysis.topPercentage.toFixed(1)}%
                                    of funding
                                </span>
                            )}
                        </div>
                    }
                    icon={<University className="h-5 w-5 text-blue-600" />}
                />
            </div>

            {/* Trend visualization */}
            <TrendVisualizer
                grants={grants}
                viewContext={
                    entityType === "institute" ? "institute" : "recipient"
                }
                height={350}
                initialChartType={chartType}
                initialMetricType={chartMetric}
                initialGrouping={
                    entityType === "institute" ? "recipient" : "org"
                }
            />

            {/* Entity-specific analysis sections */}
            {entityType === "institute" && (
                <TopRecipientsAnalysis
                    recipients={recipients}
                    totalFunding={entity.total_funding || 0}
                />
            )}

            {/* Time Period Analysis - detailed yearly funding breakdown */}
            <TimePeriodAnalytics
                grants={grants}
                title="Funding by Year"
                periodType="yearly"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Agency Breakdown */}
                {agencies.length > 0 && (
                    <AgencyBreakdown
                        grants={grants}
                        agencies={agencies}
                        totalFunding={entity.total_funding || 0}
                    />
                )}

                {/* Entity-specific stats card */}
                <Card className="p-4">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                        {entityType === "institute" ? (
                            <>
                                <Users className="h-5 w-5 mr-2 text-blue-600" />
                                Recipient Statistics
                            </>
                        ) : (
                            <>
                                <BookMarked className="h-5 w-5 mr-2 text-blue-600" />
                                Grant Statistics
                            </>
                        )}
                    </h3>

                    <div className="space-y-3">
                        {/* Display entity-specific stats */}
                        <>
                            {(entityType === "institute"
                                ? [
                                      [
                                          "Active Recipients",
                                          activeRecipientsData?.text || "N/A",
                                      ],
                                      [
                                          "Funding per Recipient",
                                          recipients.length > 0
                                              ? formatCurrency(
                                                    (entity.total_funding ||
                                                        0) / recipients.length
                                                )
                                              : "N/A",
                                      ],
                                      [
                                          "Funding per Grant",
                                          grants.length > 0
                                              ? formatCurrency(
                                                    (entity.total_funding ||
                                                        0) / grants.length
                                                )
                                              : "N/A",
                                      ],
                                      [
                                          "Grants per Recipient",
                                          recipients.length > 0
                                              ? (
                                                    grants.length /
                                                    recipients.length
                                                ).toFixed(1)
                                              : "N/A",
                                      ],
                                  ]
                                : [
                                      [
                                          "Mean Grant Value",
                                          formatCurrency(
                                              entity.total_funding || 0
                                          ),
                                      ],
                                      [
                                          "Mean Grant Duration",
                                          grantDuration.text,
                                      ],
                                      [
                                          "Activity Period",
                                          fundingGrowth.yearsSpan
                                              ? `${fundingGrowth.yearsSpan} years`
                                              : "N/A",
                                      ],
                                      [
                                        "Most Active Year",
                                        // calculate
                                        // get the year with the most grants
                                        (() => {
                                            const yearCounts = grants.reduce((acc, grant) => {
                                                const year = new Date(
                                                    grant.agreement_start_date
                                                ).getFullYear();
                                                acc[year] = (acc[year] || 0) + 1;
                                                return acc;
                                            }, {} as Record<string, number>);
                                            
                                            if (Object.keys(yearCounts).length === 0) return "N/A";
                                            
                                            return Object.entries(yearCounts)
                                                .sort((a, b) => b[1] - a[1])[0][0];
                                        })(),
                                      ]
                                  ]
                            ).map(([label, value], index: number) => (
                                <div
                                    key={index}
                                    className="flex justify-between py-2 border-b"
                                >
                                    <span className="text-gray-600">
                                        {label}
                                    </span>
                                    <span className="font-medium">{value}</span>
                                </div>
                            ))}
                        </>
                    </div>
                </Card>
            </div>
        </div>
    );
};
