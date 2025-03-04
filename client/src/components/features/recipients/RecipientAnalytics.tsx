// src/components/features/recipients/RecipientAnalytics.tsx
import {
    FileSearch,
    BookMarked,
    DollarSign,
    Circle,
    Calendar,
} from "lucide-react";
import { ChartControls } from "@/components/common/ui/ChartControls";
import AnalyticsChart from "@/components/features/visualizations/AnalyticsChart";
import { AnalyticsCards } from "@/components/features/recipients/AnalyticsCards";
import { ChartMetric, ChartType } from "@/types/search";
import { ResearchGrant } from "@/types/models";
import { formatCurrency } from "@/utils/format";

// Analytics Component
interface RecipientAnalyticsProps {
    analyticsData: {
        fundingByYear: any[];
        grantsByYear: any[];
    };
    chartType: ChartType;
    setChartType: (type: ChartType) => void;
    chartMetric: ChartMetric;
    setChartMetric: (metric: ChartMetric) => void;
    processedGrants: ResearchGrant[];
    agencies: string[];
    totalFunding: number;
    totalYears: number;
    averagePerYear: number;
    uniqueGrantCount: number;
    averageGrantValue: number;
}

const RecipientAnalytics = ({
    analyticsData,
    chartType,
    setChartType,
    chartMetric,
    setChartMetric,
    processedGrants,
    agencies,
    totalFunding,
    totalYears,
    averagePerYear,
    uniqueGrantCount,
    averageGrantValue,
}: RecipientAnalyticsProps) => {
    // Get colors for chart based on agency name
    const getAgencyColor = (agency: string): string => {
        const colors: Record<string, string> = {
            NSERC: "#2563eb", // blue
            SSHRC: "#7c3aed", // purple
            CIHR: "#059669", // green
        };
        return colors[agency] || "#6b7280"; // gray as fallback
    };

    const chartControlsMetrics = [
        { id: "funding" as ChartMetric, label: "Funding", icon: DollarSign },
        { id: "grants" as ChartMetric, label: "Grants", icon: BookMarked },
    ];

    const cards = [
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
                            color={getAgencyColor(agency)}
                            fill={getAgencyColor(agency)}
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
        {
            title: "Funding Summary",
            icon: <Calendar className="h-4 w-4 mr-1.5 text-blue-600" />,
            fields: [
                {
                    label: "Peak Year",
                    value:
                        analyticsData.fundingByYear.length > 0
                            ? analyticsData.fundingByYear.reduce(
                                  (max, year) => {
                                      const yearTotal = Object.entries(year)
                                          .filter(([key]) => key !== "year")
                                          .reduce(
                                              (sum, [_, value]) =>
                                                  sum + (value as number),
                                              0
                                          );

                                      const maxTotal = Object.entries(max)
                                          .filter(([key]) => key !== "year")
                                          .reduce(
                                              (sum, [_, value]) =>
                                                  sum + (value as number),
                                              0
                                          );

                                      return yearTotal > maxTotal ? year : max;
                                  },
                                  analyticsData.fundingByYear[0]
                              ).year
                            : "N/A",
                },
                {
                    label: "Highest Grant",
                    value: formatCurrency(
                        Math.max(
                            ...processedGrants.map((g) => g.agreement_value),
                            0
                        )
                    ),
                },
                { label: "Active Years", value: totalYears },
                {
                    label: "Annual Average",
                    value: formatCurrency(averagePerYear),
                },
                {
                    label: "Primary Agency",
                    value:
                        agencies.length > 0
                            ? agencies.reduce((max, agency) => {
                                  const agencyGrantCount =
                                      processedGrants.filter(
                                          (grant) => grant.org === agency
                                      ).length;

                                  const maxGrantCount = processedGrants.filter(
                                      (grant) => grant.org === max
                                  ).length;

                                  return agencyGrantCount > maxGrantCount
                                      ? agency
                                      : max;
                              }, agencies[0])
                            : "N/A",
                },
            ],
        },
        {
            title: "Grant Statistics",
            icon: <BookMarked className="h-4 w-4 mr-1.5 text-blue-600" />,
            fields: [
                { label: "Total Grants", value: uniqueGrantCount },
                {
                    label: "Amended Grants",
                    value: processedGrants.filter(
                        (g) =>
                            g.amendments_history &&
                            g.amendments_history.length > 1
                    ).length,
                },
                {
                    label: "Average Value",
                    value:
                        processedGrants.length > 0
                            ? formatCurrency(averageGrantValue)
                            : "N/A",
                },
                {
                    label: "Median Value",
                    value:
                        processedGrants.length > 0
                            ? formatCurrency(
                                  processedGrants
                                      .map((g) => g.agreement_value)
                                      .sort((a, b) => a - b)[
                                      Math.floor(processedGrants.length / 2)
                                  ]
                              )
                            : "N/A",
                },
                {
                    label: "Avg. Duration",
                    value:
                        processedGrants.length > 0
                            ? (() => {
                                  const avgMonths =
                                      processedGrants.reduce((sum, grant) => {
                                          const start = new Date(
                                              grant.agreement_start_date
                                          );
                                          const end = new Date(
                                              grant.agreement_end_date
                                          );
                                          const months =
                                              (end.getFullYear() -
                                                  start.getFullYear()) *
                                                  12 +
                                              end.getMonth() -
                                              start.getMonth();
                                          return sum + months;
                                      }, 0) / processedGrants.length;

                                  const years = Math.floor(avgMonths / 12);
                                  const months = Math.round(avgMonths % 12);

                                  if (years > 0 && months > 0) {
                                      return `${years}y ${months}m`;
                                  } else if (years > 0) {
                                      return `${years} years`;
                                  } else {
                                      return `${months} months`;
                                  }
                              })()
                            : "N/A",
                },
            ],
        },
    ];

    return (
        <div className="space-y-6">
            {/* Chart toggles */}
            <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 justify-between items-center">
                <h2 className="text-lg font-medium">Funding Analytics</h2>
                <ChartControls
                    chartType={chartType}
                    setChartType={setChartType}
                    chartMetric={chartMetric}
                    setChartMetric={setChartMetric}
                    metrics={chartControlsMetrics}
                />
            </div>

            {analyticsData.fundingByYear.length > 0 ? (
                <div>
                    {/* Main chart */}
                    <AnalyticsChart
                        chartType={chartType}
                        chartMetric={chartMetric}
                        analyticsData={analyticsData}
                        agencies={agencies}
                    />

                    {/* Analytics cards */}
                    <AnalyticsCards cards={cards} />
                </div>
            ) : (
                <div className="p-8 text-center">
                    <FileSearch className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">
                        No Analytics Available
                    </h3>
                    <p className="text-gray-500">
                        There isn't enough data to display analytics for this
                        recipient.
                    </p>
                </div>
            )}
        </div>
    );
};

export default RecipientAnalytics;
