// src/components/features/institutes/InstituteAnalytics.tsx
import {
    BookMarked,
    DollarSign,
    Circle,
    FileSearch,
    TrendingUp,
    GraduationCap,
} from "lucide-react";
import { ChartMetric, ChartType } from "@/types/search";
import { ResearchGrant } from "@/types/models";
import { formatCurrency } from "@/utils/format";
import { getCategoryColor } from "@/utils/chartColors";
import ChartPanel from "@/components/features/visualizations/ChartPanel";
import { AnalyticsCards } from "@/components/features/recipients/AnalyticsCards";
import { Card } from "@/components/common/ui/Card";

// Analytics Component
interface InstituteAnalyticsProps {
    analyticsData: {
        fundingByYear: any[];
        grantsByYear: any[];
    };
    chartType: ChartType;
    setChartType: (type: ChartType) => void;
    chartMetric: ChartMetric;
    setChartMetric: (metric: ChartMetric) => void;
    processedGrants: ResearchGrant[];
    recipients: any[];
    agencies: string[];
    totalFunding: number;
    totalYears: number;
    averagePerYear: number;
    uniqueGrantCount: number;
    uniqueRecipientCount: number;
    averageGrantValue: number;
}

const InstituteAnalytics = ({
    analyticsData,
    chartType,
    chartMetric,
    processedGrants,
    agencies,
    totalFunding,
    totalYears,
    averagePerYear,
    uniqueGrantCount,
    uniqueRecipientCount,
    averageGrantValue,
}: InstituteAnalyticsProps) => {
    const cards = [
        // Funding Breakdown card
        {
            title: "Funding Breakdown by Agency",
            icon: <DollarSign className="h-4 w-4 mr-1.5 text-blue-600" />,
            fields: agencies.map((agency) => {
                const agencyTotal = processedGrants
                    .filter((grant) => grant.org === agency)
                    .reduce((sum, grant) => sum + grant.agreement_value, 0);

                const percentage =
                    totalFunding > 0 ? (agencyTotal / totalFunding) * 100 : 0;

                return {
                    label: agency,
                    icon: (
                        <Circle
                            className="h-3.5 w-3.5 mr-1.5"
                            color={getCategoryColor(
                                agency,
                                agencies.indexOf(agency)
                            )}
                            fill={getCategoryColor(
                                agency,
                                agencies.indexOf(agency)
                            )}
                        />
                    ),
                    value: (
                        <div className="text-right">
                            <div className="font-medium text-sm">
                                {formatCurrency(agencyTotal)}
                            </div>
                            <div className="text-xs text-gray-500">
                                {percentage.toFixed(1)}%
                            </div>
                        </div>
                    ),
                };
            }),
        },
        // Funding Summary card
        {
            title: "Funding Summary",
            icon: <DollarSign className="h-4 w-4 mr-1.5 text-blue-600" />,
            fields: [
                {
                    label: "Total Funding",
                    value: formatCurrency(totalFunding),
                },
                {
                    label: "Average Per Grant",
                    value: formatCurrency(averageGrantValue),
                },
                {
                    label: "Annual Average",
                    value: formatCurrency(averagePerYear),
                },
            ],
        },
        // Grants Summary card
        {
            title: "Grants Summary",
            icon: <BookMarked className="h-4 w-4 mr-1.5 text-blue-600" />,
            fields: [
                {
                    label: "Total Grants",
                    value: uniqueGrantCount.toString(),
                },
                {
                    label: "Active Years",
                    value: totalYears.toString(),
                },
                {
                    label: "Grants Per Year",
                    value:
                        totalYears > 0
                            ? (uniqueGrantCount / totalYears).toFixed(1)
                            : "0",
                },
            ],
        },
        // Recipients Analysis card
        {
            title: "Recipients Analysis",
            icon: <GraduationCap className="h-4 w-4 mr-1.5 text-blue-600" />,
            fields: [
                {
                    label: "Total Recipients",
                    value: uniqueRecipientCount.toString(),
                },
                {
                    label: "Average Grants/Recipient",
                    value:
                        uniqueRecipientCount > 0
                            ? (uniqueGrantCount / uniqueRecipientCount).toFixed(
                                  1
                              )
                            : "0",
                },
                {
                    label: "Average Funding/Recipient",
                    value:
                        uniqueRecipientCount > 0
                            ? formatCurrency(
                                  totalFunding / uniqueRecipientCount
                              )
                            : formatCurrency(0),
                },
            ],
        },
        // Trend Analysis card
        {
            title: "Funding Trend Analysis",
            icon: <TrendingUp className="h-4 w-4 mr-1.5 text-blue-600" />,
            fields: [
                {
                    label: "Trend Direction",
                    value: (() => {
                        if (
                            !analyticsData.fundingByYear ||
                            analyticsData.fundingByYear.length < 2
                        )
                            return "Insufficient data";

                        const sortedData = [
                            ...analyticsData.fundingByYear,
                        ].sort((a, b) => a.year - b.year);
                        const firstYear = sortedData[0];
                        const lastYear = sortedData[sortedData.length - 1];

                        // Calculate total funding for first and last year
                        const firstYearTotal = Object.entries(firstYear)
                            .filter(([key]) => key !== "year")
                            .reduce(
                                (sum, [_, value]) => sum + (Number(value) || 0),
                                0
                            );

                        const lastYearTotal = Object.entries(lastYear)
                            .filter(([key]) => key !== "year")
                            .reduce(
                                (sum, [_, value]) => sum + (Number(value) || 0),
                                0
                            );

                        if (lastYearTotal > firstYearTotal * 1.1)
                            return "Increasing";
                        if (lastYearTotal < firstYearTotal * 0.9)
                            return "Decreasing";
                        return "Stable";
                    })(),
                },
                {
                    label: "Years With Data",
                    value: analyticsData.fundingByYear
                        ? analyticsData.fundingByYear.length.toString()
                        : "0",
                },
                {
                    label: "Latest Year",
                    value: (() => {
                        if (
                            !analyticsData.fundingByYear ||
                            analyticsData.fundingByYear.length === 0
                        )
                            return "N/A";

                        const years = analyticsData.fundingByYear.map(
                            (d) => d.year
                        );
                        return Math.max(...years).toString();
                    })(),
                },
            ],
        },
    ];

    return (
        <div className="space-y-6">
            {/* Chart Panel */}
            {analyticsData.fundingByYear.length > 0 ? (
                <div>
                    {/* Main chart using our new ChartPanel component */}
                    <ChartPanel
                        data={{
                            fundingByYear: analyticsData.fundingByYear,
                            grantsByYear: analyticsData.grantsByYear,
                        }}
                        title="Funding Analytics"
                        initialChartType={chartType}
                        initialMetric={chartMetric}
                        categories={agencies}
                        showControls={true}
                        className="mb-6"
                    />

                    {/* Analytics cards */}
                    <AnalyticsCards cards={cards} />
                </div>
            ) : (
                <Card className="p-8 text-center">
                    <FileSearch className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">
                        No Analytics Available
                    </h3>
                    <p className="text-gray-500">
                        There isn't enough data to display analytics for this
                        institute.
                    </p>
                </Card>
            )}
        </div>
    );
};

export default InstituteAnalytics;
