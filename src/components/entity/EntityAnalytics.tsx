// src/components/entity/EntityAnalytics.tsx
'use client';

import React, { useState } from "react";
import Link from "next/link";
import { GrantWithDetails, InstituteWithStats, RecipientWithStats } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { TrendVisualizer } from "@/components/visualizations/TrendVisualizer";
import {
    LuTrendingUp,
    LuTrendingDown,
    LuMoveRight,
    LuGraduationCap,
    LuCalendar,
    LuAward,
    LuCalendarClock,
} from "react-icons/lu";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { IconType } from "react-icons";
import { getCategoryColor } from "@/lib/chartColors";
import { MdAccountBalance, MdOutlineSsidChart } from "react-icons/md";

// ============================================================================
// ANALYTICS UTILITY FUNCTIONS
// ============================================================================

// Calculate funding growth over time
function calculateFundingGrowth(grants: GrantWithDetails[]) {
    if (!grants || grants.length === 0) {
        return { percentChange: 0, yearsSpan: 0 };
    }

    const sortedGrants = [...grants].sort((a, b) =>
        new Date(a.agreement_start_date).getTime() - new Date(b.agreement_start_date).getTime()
    );

    const firstYear = new Date(sortedGrants[0].agreement_start_date).getFullYear();
    const lastYear = new Date(sortedGrants[sortedGrants.length - 1].agreement_start_date).getFullYear();
    const yearsSpan = lastYear - firstYear;

    if (yearsSpan === 0) {
        return { percentChange: 0, yearsSpan: 0 };
    }

    // Calculate average funding for first and last year
    const firstYearGrants = grants.filter(g =>
        new Date(g.agreement_start_date).getFullYear() === firstYear
    );
    const lastYearGrants = grants.filter(g =>
        new Date(g.agreement_start_date).getFullYear() === lastYear
    );

    const firstYearTotal = firstYearGrants.reduce((sum, g) => sum + (Number(g.agreement_value) || 0), 0);
    const lastYearTotal = lastYearGrants.reduce((sum, g) => sum + (Number(g.agreement_value) || 0), 0);

    if (firstYearTotal === 0) {
        return { percentChange: 0, yearsSpan };
    }

    const percentChange = ((lastYearTotal - firstYearTotal) / firstYearTotal) * 100;

    return { percentChange, yearsSpan };
}

// Calculate agency specialization
function calculateAgencySpecialization(grants: GrantWithDetails[]) {
    if (!grants || grants.length === 0) {
        return { specialization: "Unknown", topAgency: null, topPercentage: 0 };
    }

    const agencyFunding: Record<string, number> = {};
    let totalFunding = 0;

    grants.forEach(grant => {
        const agency = grant.org || "Unknown";
        const value = Number(grant.agreement_value) || 0;
        agencyFunding[agency] = (agencyFunding[agency] || 0) + value;
        totalFunding += value;
    });

    const agencies = Object.entries(agencyFunding).sort((a, b) => b[1] - a[1]);

    if (agencies.length === 0) {
        return { specialization: "Unknown", topAgency: null, topPercentage: 0 };
    }

    const [topAgency, topFunding] = agencies[0];
    const topPercentage = (topFunding / totalFunding) * 100;

    let specialization: string;
    if (topPercentage > 80) {
        specialization = "Highly Specialized";
    } else if (topPercentage > 50) {
        specialization = "Specialized";
    } else if (agencies.length === 1) {
        specialization = "Single Agency";
    } else {
        specialization = "Diversified";
    }

    return { specialization, topAgency, topPercentage };
}

// Calculate recipient concentration (for institutes)
function calculateRecipientConcentration(recipients: RecipientWithStats[], totalFunding: number) {
    if (!recipients || recipients.length === 0 || totalFunding === 0) {
        return { rating: "No data", concentration: 0 };
    }

    const sorted = [...recipients].sort((a, b) =>
        (Number(b.total_funding) || 0) - (Number(a.total_funding) || 0)
    );

    const top3Funding = sorted.slice(0, 3).reduce((sum, r) => sum + (Number(r.total_funding) || 0), 0);
    const concentration = (top3Funding / totalFunding) * 100;

    let rating: string;
    if (concentration > 70) {
        rating = "Highly Concentrated";
    } else if (concentration > 40) {
        rating = "Moderately Concentrated";
    } else {
        rating = "Well Distributed";
    }

    return { rating, concentration };
}

// Calculate average grant duration
function calculateAvgGrantDuration(grants: GrantWithDetails[]) {
    if (!grants || grants.length === 0) {
        return { text: "N/A", months: 0 };
    }

    const durations = grants
        .filter(g => g.agreement_end_date)
        .map(g => {
            const start = new Date(g.agreement_start_date);
            const end = new Date(g.agreement_end_date!);
            const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
            return Math.max(0, months);
        });

    if (durations.length === 0) {
        return { text: "N/A", months: 0 };
    }

    const avgMonths = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const years = Math.floor(avgMonths / 12);
    const months = Math.round(avgMonths % 12);

    let text: string;
    if (years > 0) {
        text = `${years} year${years !== 1 ? 's' : ''}`;
        if (months > 0) {
            text += ` ${months} month${months !== 1 ? 's' : ''}`;
        }
    } else {
        text = `${months} month${months !== 1 ? 's' : ''}`;
    }

    return { text, months: avgMonths };
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// KPI Card
export const KpiCard = ({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: React.ReactNode;
    icon: IconType;
}) => (
    <Card className="p-2.5 md:p-4 flex flex-col flex-1">
        <div className="flex items-start mb-0.5 md:mb-2 gap-1.5 md:gap-2">
            <Icon className="size-9 md:size-3.5 text-blue-600 md:mt-0.75" />
            <h3 className="font-medium text-gray-600 md:text-gray-800 text-[11px] md:text-sm">{title}</h3>
        </div>

        <div className="h-px bg-gray-200 mb-2 md:mb-1.5" />

        <div className="text-sm md:text-xl font-bold text-gray-900 flex flex-1 items-end md:items-center">{value}</div>
    </Card>
);

// Top Recipients Analysis
export const TopRecipientsAnalysis = ({
    recipients,
    totalFunding,
}: {
    recipients: any[];
    totalFunding: number;
}) => {
    const topRecipients = [...recipients]
        .sort((a, b) => (b.total_funding || 0) - (a.total_funding || 0))
        .slice(0, 5);

    const maxFunding = Math.max(...topRecipients.map(r => r.total_funding || 0));

    return (
        <Card>
            <Card.Header
                icon={LuGraduationCap}
                title="Top Recipients"
                size="md"
            />
            <Card.Content className="space-y-4">
                {topRecipients.length === 0 ? (
                    <p className="text-gray-500 text-sm">No recipient data available</p>
                ) : (
                    topRecipients.map((recipient) => {
                        const sharePercentage = totalFunding > 0
                            ? ((recipient.total_funding || 0) / totalFunding) * 100
                            : 0;

                        const barPercentage = maxFunding > 0
                            ? ((recipient.total_funding || 0) / maxFunding) * 100
                            : 0;

                        return (
                            <div key={recipient.recipient_id}>
                                <div className="flex justify-between items-end mb-0.5 md:mb-1">
                                    <Link
                                        href={`/recipients/${recipient.recipient_id}`}
                                        className="font-medium text-gray-900 text-xs md:text-sm truncate pr-2 hover:text-blue-600 transition-colors"
                                        title={recipient.legal_name}
                                    >
                                        {recipient.legal_name}
                                    </Link>
                                    <div className="font-semibold text-gray-900 text-xs md:text-sm whitespace-nowrap">
                                        {formatCurrency(recipient.total_funding)}
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-0.5 md:mb-1">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all"
                                        style={{ width: `${barPercentage}%` }}
                                    />
                                </div>
                                <div className="text-right text-[10px] md:text-xs text-gray-500">
                                    {sharePercentage.toFixed(1)}% of total
                                </div>
                            </div>
                        );
                    })
                )}
            </Card.Content>
        </Card>
    );
};

// Agency Breakdown
export const AgencyBreakdown = ({
    grants,
    totalFunding,
    title = "Agency Breakdown",
}: {
    grants: GrantWithDetails[];
    totalFunding: number;
    title?: string;
}) => {
    const agencyFunding: Record<string, number> = {};

    grants.forEach(grant => {
        const agency = grant.org || "Unknown";
        agencyFunding[agency] = (agencyFunding[agency] || 0) + (Number(grant.agreement_value) || 0);
    });

    const agencies = Object.entries(agencyFunding)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return (
        <Card>
            <Card.Header
                icon={MdAccountBalance}
                title={title}
                size="md"
            />
            <Card.Content className="space-y-3">
                {agencies.map(([agency, funding], index) => {
                    const percentage = totalFunding > 0 ? (funding / totalFunding) * 100 : 0;

                    return (
                        <div key={agency} className="flex items-center gap-4">
                            <div className="w-12 md:w-20 font-medium text-gray-900 text-sm md:text-base">
                                {agency}
                            </div>
                            <div className="flex-1 mb-2">
                                <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-0.25 md:mb-0.5 text-xs md:text-sm">
                                    <span>{percentage.toFixed(1)}%</span>
                                    <span className="font-semibold text-gray-900 text-xs md:text-base">
                                        {formatCurrency(funding)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: getCategoryColor(agency, index)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </Card.Content>
        </Card>
    );
};

// Time Period Analytics
export const TimePeriodAnalytics = ({
    grants,
    title = "Funding by Year",
}: {
    grants: GrantWithDetails[];
    title?: string;
}) => {
    // Group by year
    const yearData: Record<number, { funding: number; count: number }> = {};

    grants.forEach(grant => {
        const year = new Date(grant.agreement_start_date).getFullYear();
        if (!yearData[year]) {
            yearData[year] = { funding: 0, count: 0 };
        }
        yearData[year].funding += Number(grant.agreement_value) || 0;
        yearData[year].count += 1;
    });

    const years = Object.entries(yearData)
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
        .slice(0, 10);

    const maxFunding = Math.max(...years.map(([_, data]) => data.funding));

    return (
        <Card>
            <Card.Header
                icon={LuCalendarClock}
                title={title}
                size="md"
            />
            <Card.Content className="space-y-3">
                {years.map(([year, data]) => {
                    const percentage = maxFunding > 0 ? (data.funding / maxFunding) * 100 : 0;

                    return (
                        <div key={year} className="flex items-center gap-4">
                            <div className="w-8 md:w-12 font-medium text-gray-900 text-sm md:text-base">{year}</div>
                            <div className="flex-1 mb-2">
                                <div className="flex justify-between items-end text-sm text-gray-600 mb-0.25 md:mb-0.5 text-xs md:text-sm">
                                    <span className="text-[10px] md:text-sm">{data.count.toLocaleString()} grant{data.count !== 1 ? 's' : ''}</span>
                                    <span className="font-semibold text-gray-900 text-xs md:text-base">
                                        {formatCurrency(data.funding)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </Card.Content>
        </Card>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface EntityAnalyticsProps {
    entity: InstituteWithStats | RecipientWithStats;
    entityType: 'institute' | 'recipient';
    grants: GrantWithDetails[];
    recipients?: any[];
}

export default function EntityAnalytics({
    entity,
    entityType,
    grants,
    recipients = [],
}: EntityAnalyticsProps) {
    const [chartType] = useState<"line" | "stacked" | "grouped">("line");
    const [chartMetric] = useState<"funding" | "count">("funding");

    // Extract the correct ID based on entity type
    const entityId = entityType === 'institute'
        ? (entity as InstituteWithStats).institute_id
        : (entity as RecipientWithStats).recipient_id;

    // Calculate analytics
    const fundingGrowth = calculateFundingGrowth(grants);
    const agencyAnalysis = calculateAgencySpecialization(grants);
    const grantDuration = calculateAvgGrantDuration(grants);

    const recipientDiversity =
        entityType === "institute" && recipients.length > 0
            ? calculateRecipientConcentration(recipients, entity.total_funding || 0)
            : null;

    return (
        <div className="flex flex-col gap-4 md:gap-6">
            {/* KPI Cards */}
            <div className="flex md:grid md:grid-cols-3 gap-2 md:gap-4">
                {/* Funding Growth */}
                <KpiCard
                    icon={MdOutlineSsidChart}
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
                                {fundingGrowth.yearsSpan > 0 && ` over ${fundingGrowth.yearsSpan} years`}
                                {Math.abs(fundingGrowth.percentChange) < 10 ? (
                                    <LuMoveRight className="h-4 w-4 ml-1 inline" />
                                ) : fundingGrowth.percentChange < 0 ? (
                                    <LuTrendingDown className="h-4 w-4 ml-1 inline" />
                                ) : (
                                    <LuTrendingUp className="h-4 w-4 ml-1 inline" />
                                )}
                            </span>
                        </div>
                    }
                />

                {/* Entity-specific metric */}
                {entityType === "institute" ? (
                    <KpiCard
                        icon={LuGraduationCap}
                        title="Recipient Diversity"
                        value={
                            <div>
                                <span className="italic text-sm md:text-lg">
                                    {recipientDiversity?.rating || "No data"}
                                </span>
                                {recipientDiversity && (
                                    <span className="block text-[10px] md:text-xs text-gray-600 md:mt-1 font-normal">
                                        Top 3: {recipientDiversity.concentration.toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        }
                    />
                ) : (
                    <KpiCard
                        icon={LuCalendar}
                        title="Grant Duration"
                        value={
                            <div>
                                <span className="text-sm md:text-lg">{grantDuration.text}</span>
                                <span className="block text-[10px] md:text-xs text-gray-600 md:mt-1 font-normal">
                                    Average across {grants.length} grants
                                </span>
                            </div>
                        }
                    />
                )}

                {/* Agency Distribution */}
                <KpiCard
                    title="Agency Distribution"
                    value={
                        <div>
                            <span className="italic text-sm md:text-lg">{agencyAnalysis.specialization}</span>
                            {agencyAnalysis.topAgency && (
                                <span className="block text-[10px] md:text-xs text-gray-600 md:mt-1 font-normal">
                                    {agencyAnalysis.topAgency}: {agencyAnalysis.topPercentage.toFixed(1)}%
                                </span>
                            )}
                        </div>
                    }
                    icon={MdAccountBalance}
                />
            </div>

            {/* Trend Visualizer */}
            <TrendVisualizer
                entityType={entityType}
                ids={[entityId]}
                viewContext={entityType === "institute" ? "institute" : "recipient"}
                height={350}
                initialChartType={chartType}
                initialMetricType={chartMetric}
                initialGrouping={entityType === "institute" ? "recipient" : "org"}
            />

            {/* Institute-specific: Top Recipients */}
            {entityType === "institute" && recipients.length > 0 && (
                <TopRecipientsAnalysis
                    recipients={recipients}
                    totalFunding={entity.total_funding || 0}
                />
            )}

            {/* Time Period Analytics */}
            <TimePeriodAnalytics grants={grants} />

            {/* Agency Breakdown */}
            <div className="grid gap-6 grid-cols-1">
                <AgencyBreakdown
                    grants={grants}
                    totalFunding={entity.total_funding || 0}
                />
            </div>
        </div>
    );
}
