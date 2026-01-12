// src/components/entity/EntityAnalytics.tsx
'use client';

import React, { useState } from "react";
import { GrantWithDetails, InstituteWithStats, RecipientWithStats } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { TrendVisualizer } from "@/components/visualizations/TrendVisualizer";
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
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

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

// Calculate active recipients
function calculateActiveRecipients(recipients: any[], grants: GrantWithDetails[]) {
    if (!recipients || recipients.length === 0) {
        return { text: "N/A", count: 0 };
    }

    const currentYear = new Date().getFullYear();
    const recentYears = 3;

    const activeRecipientIds = new Set(
        grants
            .filter(g => {
                const grantYear = new Date(g.agreement_start_date).getFullYear();
                return grantYear >= currentYear - recentYears;
            })
            .map(g => g.recipient_id)
    );

    const activeCount = activeRecipientIds.size;
    const percentage = ((activeCount / recipients.length) * 100).toFixed(0);

    return {
        text: `${activeCount} (${percentage}%)`,
        count: activeCount
    };
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
        text = `${years}Y ${months}M`;
    } else {
        text = `${months} months`;
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
    icon,
}: {
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
}) => (
    <Card className="p-4">
        <div className="flex items-center mb-2">
            {icon}
            <h3 className="font-medium text-gray-800 ml-2 text-sm">{title}</h3>
        </div>
        <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
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

    return (
        <Card>
            <Card className="p-6">
                <div className="flex items-center mb-4">
                    <GraduationCap className="h-5 w-5 text-gray-700 mr-2" />
                    <h3 className="font-semibold text-gray-900">Top Recipients</h3>
                </div>
                <div className="space-y-3">
                    {topRecipients.length === 0 ? (
                        <p className="text-gray-500 text-sm">No recipient data available</p>
                    ) : (
                        topRecipients.map((recipient) => {
                            const percentage = totalFunding > 0
                                ? ((recipient.total_funding || 0) / totalFunding) * 100
                                : 0;

                            return (
                                <div key={recipient.recipient_id} className="flex items-center gap-2">
                                    <div className="w-32 text-sm font-medium text-gray-900 truncate">
                                        {recipient.legal_name}
                                    </div>
                                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="w-24 text-right text-sm font-medium text-gray-900">
                                        {formatCurrency(recipient.total_funding)}
                                    </div>
                                    <div className="w-12 text-right text-sm text-gray-500">
                                        {percentage.toFixed(1)}%
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </Card>
        </Card>
    );
};

// Agency Breakdown
export const AgencyBreakdown = ({
    grants,
    totalFunding,
}: {
    grants: GrantWithDetails[];
    totalFunding: number;
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
        <Card className="p-6">
            <div className="flex items-center mb-4">
                <University className="h-5 w-5 text-gray-700 mr-2" />
                <h3 className="font-semibold text-gray-900">Agency Breakdown</h3>
            </div>
            <div className="space-y-3">
                {agencies.map(([agency, funding]) => {
                    const percentage = totalFunding > 0 ? (funding / totalFunding) * 100 : 0;

                    return (
                        <div key={agency} className="flex items-center gap-2">
                            <div className="w-20 text-sm font-medium text-gray-900">
                                {agency}
                            </div>
                            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <div className="w-24 text-right text-sm font-medium text-gray-900">
                                {formatCurrency(funding)}
                            </div>
                            <div className="w-12 text-right text-sm text-gray-500">
                                {percentage.toFixed(1)}%
                            </div>
                        </div>
                    );
                })}
            </div>
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
        <Card className="p-6">
            <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-gray-700 mr-2" />
                <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="space-y-3">
                {years.map(([year, data]) => {
                    const percentage = maxFunding > 0 ? (data.funding / maxFunding) * 100 : 0;

                    return (
                        <div key={year} className="flex items-center gap-4">
                            <div className="w-16 font-medium text-gray-900">{year}</div>
                            <div className="flex-1">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>{data.count.toLocaleString()} grants</span>
                                    <span className="font-semibold text-gray-900">
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
            </div>
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

    // Calculate analytics
    const fundingGrowth = calculateFundingGrowth(grants);
    const agencyAnalysis = calculateAgencySpecialization(grants);
    const grantDuration = calculateAvgGrantDuration(grants);

    const recipientDiversity =
        entityType === "institute" && recipients.length > 0
            ? calculateRecipientConcentration(recipients, entity.total_funding || 0)
            : null;

    const activeRecipientsData =
        entityType === "institute" && recipients.length > 0
            ? calculateActiveRecipients(recipients, grants)
            : null;

    return (
        <div className="flex flex-col gap-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Funding Growth */}
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
                                {fundingGrowth.yearsSpan > 0 && ` over ${fundingGrowth.yearsSpan} years`}
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

                {/* Entity-specific metric */}
                {entityType === "institute" ? (
                    <KpiCard
                        title="Recipient Diversity"
                        value={
                            <div>
                                <span className="italic text-lg">
                                    {recipientDiversity?.rating || "No data"}
                                </span>
                                {recipientDiversity && (
                                    <span className="block text-xs text-gray-600 mt-1 font-normal">
                                        Top 3: {recipientDiversity.concentration.toFixed(1)}% of funding
                                    </span>
                                )}
                            </div>
                        }
                        icon={<GraduationCap className="h-5 w-5 text-blue-600" />}
                    />
                ) : (
                    <KpiCard
                        title="Grant Duration"
                        value={
                            <div>
                                <span className="text-lg">{grantDuration.text}</span>
                                <span className="block text-xs text-gray-600 mt-1 font-normal">
                                    Average across {grants.length} grants
                                </span>
                            </div>
                        }
                        icon={<Calendar className="h-5 w-5 text-blue-600" />}
                    />
                )}

                {/* Agency Distribution */}
                <KpiCard
                    title="Agency Distribution"
                    value={
                        <div>
                            <span className="italic text-lg">{agencyAnalysis.specialization}</span>
                            {agencyAnalysis.topAgency && (
                                <span className="block text-xs text-gray-600 mt-1 font-normal">
                                    {agencyAnalysis.topAgency}: {agencyAnalysis.topPercentage.toFixed(1)}%
                                </span>
                            )}
                        </div>
                    }
                    icon={<University className="h-5 w-5 text-blue-600" />}
                />
            </div>

            {/* Trend Visualizer */}
            <TrendVisualizer
                grants={grants}
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
            <TimePeriodAnalytics grants={grants} title="Funding by Year" />

            {/* Agency Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AgencyBreakdown
                    grants={grants}
                    totalFunding={entity.total_funding || 0}
                />

                {/* Additional Stats */}
                <Card className="p-6">
                    <div className="flex items-center mb-4">
                        {entityType === "institute" ? (
                            <Users className="h-5 w-5 text-gray-700 mr-2" />
                        ) : (
                            <BookMarked className="h-5 w-5 text-gray-700 mr-2" />
                        )}
                        <h3 className="font-semibold text-gray-900">
                            {entityType === "institute" ? "Recipient Statistics" : "Grant Statistics"}
                        </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        {entityType === "institute" ? (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Active Recipients</span>
                                    <span className="font-medium">{activeRecipientsData?.text || "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Funding per Recipient</span>
                                    <span className="font-medium">
                                        {recipients.length > 0
                                            ? formatCurrency((entity.total_funding || 0) / recipients.length)
                                            : "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Funding per Grant</span>
                                    <span className="font-medium">
                                        {grants.length > 0
                                            ? formatCurrency((entity.total_funding || 0) / grants.length)
                                            : "N/A"}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Grants</span>
                                    <span className="font-medium">{grants.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Average Funding</span>
                                    <span className="font-medium">
                                        {grants.length > 0
                                            ? formatCurrency((entity.total_funding || 0) / grants.length)
                                            : "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Funding Agencies</span>
                                    <span className="font-medium">{entity.funding_agencies_count || 0}</span>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
