// src/components/features/visualizations/TrendVisualizer.tsx
import React, { useState, useMemo } from "react";
import { LineChart, BarChart, BarChart2, DollarSign, Hash } from "lucide-react";
import { Grant } from "@/types/models";
import { Card } from "@/components/common/ui/Card";
import { Dropdown } from "@/components/common/ui/Dropdown";
import DataChart from "./DataChart";
import { cn } from "@/utils/cn";
import { AMENDMENT_COLORS, getCategoryColor } from "@/utils/chartColors";
import { prepareGrantsForVisualization } from "@/utils/chartDataTransforms";

export type ChartType = "line" | "bar-stacked" | "bar-grouped";
export type MetricType = "funding" | "count";
export type GroupingDimension =
    | "org"
    | "city"
    | "province"
    | "country"
    | "recipient"
    | "institute"
    | "program"
    | "year"
    | "amendment";

export type ViewContext = "search" | "recipient" | "institute" | "custom";

export interface GrantAmendment {
    amendment_number: string;
    amendment_date: string;
    agreement_value: number;
    agreement_start_date: string;
    agreement_end_date: string;
}

interface AdvancedVisualizationProps {
    // The grants data to visualize
    grants: Grant[];

    // Optional amendments history to visualize (for single grant view)
    amendmentsHistory?: GrantAmendment[];

    // Configuration props
    viewContext?: ViewContext;
    initialChartType?: ChartType;
    initialMetricType?: MetricType;
    initialGrouping?: GroupingDimension;
    availableGroupings?: GroupingDimension[];
    availableMetrics?: MetricType[];

    // Visual customization
    height?: number;
    className?: string;
    title?: string;
}

const DEFAULT_SEARCH_GROUPINGS: GroupingDimension[] = [
    "org",
    "city",
    "province",
    "country",
    "recipient",
    "institute",
];
const DEFAULT_RECIPIENT_GROUPINGS: GroupingDimension[] = [
    "org",
    "program",
    "year",
];
const DEFAULT_INSTITUTE_GROUPINGS: GroupingDimension[] = [
    "recipient",
    "org",
    "program",
    "year",
];

export const TrendVisualizer: React.FC<AdvancedVisualizationProps> = ({
    grants,
    amendmentsHistory,
    viewContext = "search",
    initialChartType = "bar-stacked",
    initialMetricType = "funding",
    initialGrouping,
    availableGroupings,
    availableMetrics = ["funding", "count"],
    height = 400,
    className,
    title,
}) => {
    // If amendmentsHistory is provided, we're visualizing a single grant's amendments
    const isAmendmentView = !!amendmentsHistory && amendmentsHistory.length > 1;

    // Add "amendment" to available groupings if we have amendment history
    const effectiveAvailableGroupings = useMemo(() => {
        if (isAmendmentView) {
            return ["amendment"];
        }
        return availableGroupings || getDefaultGroupings();
    }, [isAmendmentView, availableGroupings]);

    // Determine available groupings based on context if not explicitly provided
    function getDefaultGroupings(): GroupingDimension[] {
        switch (viewContext) {
            case "recipient":
                return DEFAULT_RECIPIENT_GROUPINGS;
            case "institute":
                return DEFAULT_INSTITUTE_GROUPINGS;
            case "search":
            default:
                return DEFAULT_SEARCH_GROUPINGS;
        }
    }

    // Initialize state with defaults appropriate for the context
    const [chartType, setChartType] = useState<ChartType>(initialChartType);
    const [metricType, setMetricType] = useState<MetricType>(initialMetricType);
    const [groupingDimension, setGroupingDimension] =
        useState<GroupingDimension>(
            initialGrouping || effectiveAvailableGroupings[0] as GroupingDimension
        );

    // Generate display options for the dropdown
    const groupingDisplayOptions = useMemo(() => {
        const displayLabels: Record<GroupingDimension, string> = {
            org: "Funding Agency",
            city: "City",
            province: "Province/State",
            country: "Country",
            recipient: "Recipient",
            institute: "Institution",
            program: "Program",
            year: "Year",
            amendment: "Amendment Version",
        };

        return effectiveAvailableGroupings.map((option) => ({
            value: option,
            label: displayLabels[option as GroupingDimension],
        }));
    }, [effectiveAvailableGroupings]);

    // Process grants to ensure all needed fields are properly formatted
    const processedGrants = useMemo(() => {
        return prepareGrantsForVisualization(grants);
    }, [grants]);

    // Prepare data for amendment visualization if needed
    const amendmentChartData = useMemo(() => {
        if (!isAmendmentView) return null;

        // Create chronological order for the chart (oldest to newest)
        const chronologicalAmendments = [...amendmentsHistory].sort((a, b) => {
            const numA = parseInt(a.amendment_number);
            const numB = parseInt(b.amendment_number);
            return numA - numB;
        });

        // For line chart format, use a single "Funding" category
        if (chartType === "line") {
            return chronologicalAmendments.map((amendment, index) => {
                // Create a date representation
                const date = new Date(
                    amendment.amendment_date || amendment.agreement_start_date
                );
                const formattedDate = `${date.getFullYear()}-${(
                    date.getMonth() + 1
                )
                    .toString()
                    .padStart(2, "0")}`;

                // Create label - "Original" for amendment 0, otherwise "Amendment X"
                const versionLabel =
                    amendment.amendment_number === "0"
                        ? "Original"
                        : `Amendment ${amendment.amendment_number}`;

                // Calculate percentage change from previous version
                let percentChange = 0;
                if (index > 0) {
                    const previousValue =
                        chronologicalAmendments[index - 1].agreement_value;
                    percentChange =
                        ((amendment.agreement_value - previousValue) /
                            previousValue) *
                        100;
                }

                return {
                    year: formattedDate, // Use year for the x-axis key
                    Funding: amendment.agreement_value, // Use a single 'Funding' category for line chart
                    value: amendment.agreement_value, // For direct value access
                    version: versionLabel, // Store version label for reference
                    percentChange: percentChange, // Store the percent change
                    displayDate: formattedDate, // For tooltip
                    amendmentNumber: amendment.amendment_number, // For coloring
                };
            });
        }
        // For bar chart format, use separate categories for each amendment
        else {
            return chronologicalAmendments.map((amendment, index) => {
                // Create a date representation
                const date = new Date(
                    amendment.amendment_date || amendment.agreement_start_date
                );
                const formattedDate = `${date.getFullYear()}-${(
                    date.getMonth() + 1
                )
                    .toString()
                    .padStart(2, "0")}`;

                // Create label - "Original" for amendment 0, otherwise "Amendment X"
                const versionLabel =
                    amendment.amendment_number === "0"
                        ? "Original"
                        : `Amendment ${amendment.amendment_number}`;

                // Calculate percentage change from previous version
                let percentChange = 0;
                if (index > 0) {
                    const previousValue =
                        chronologicalAmendments[index - 1].agreement_value;
                    percentChange =
                        ((amendment.agreement_value - previousValue) /
                            previousValue) *
                        100;
                }

                return {
                    year: formattedDate, // Use year for the x-axis key
                    [versionLabel]: amendment.agreement_value, // Use version label as the category
                    value: amendment.agreement_value, // For direct value access
                    version: versionLabel, // Store version label for reference
                    percentChange: percentChange, // Store the percent change
                    displayDate: formattedDate, // For tooltip
                    amendmentNumber: amendment.amendment_number, // For coloring
                };
            });
        }
    }, [amendmentsHistory, isAmendmentView, chartType]);

    // Prepare data for visualization based on the selected options
    const chartData = useMemo(() => {
        // If we're showing amendments, use that data directly
        if (isAmendmentView && amendmentChartData) {
            // For line charts, we use a single "Funding" category
            if (chartType === "line") {
                return {
                    data: amendmentChartData,
                    categories: ["Funding"],
                };
            }
            // For bar charts, each amendment is its own category
            else {
                const categories = amendmentChartData.map((item) => {
                    const versionKey = Object.keys(item).find(
                        (key) =>
                            key !== "year" &&
                            key !== "version" &&
                            key !== "percentChange" &&
                            key !== "displayDate" &&
                            key !== "value" &&
                            key !== "amendmentNumber" &&
                            key !== "Funding" // Exclude the Funding key we added for line charts
                    );
                    return versionKey || "";
                });

                return {
                    data: amendmentChartData,
                    categories: categories.filter(Boolean),
                };
            }
        }

        // Otherwise process the regular grants data
        if (!processedGrants || processedGrants.length === 0)
            return { data: [], categories: [] };

        const yearMap = new Map();
        const uniqueCategories = new Set<string>();

        // Group data by year and the selected dimension
        processedGrants.forEach((grant) => {
            // Extract year from the grant
            const year = new Date(grant.agreement_start_date).getFullYear();
            const grantValue = grant.agreement_value;

            // Determine the category value based on the selected dimension
            let categoryValue: string;
            switch (groupingDimension) {
                case "org":
                    categoryValue = grant.org || "Unknown";
                    break;
                case "city":
                    categoryValue = grant.city || "Unknown";
                    break;
                case "province":
                    categoryValue = grant.province || "Unknown";
                    break;
                case "country":
                    categoryValue = grant.country || "Unknown";
                    break;
                case "recipient":
                    categoryValue = grant.legal_name || "Unknown";
                    break;
                case "institute":
                    categoryValue =
                        grant.research_organization_name || "Unknown";
                    break;
                case "program":
                    categoryValue = grant.prog_title_en || "Unknown";
                    break;
                case "year":
                    categoryValue = "Value";
                    break;
                default:
                    categoryValue = "Unknown";
            }

            // Add to unique categories for legend
            uniqueCategories.add(categoryValue);

            // Initialize year data if needed
            if (!yearMap.has(year)) {
                yearMap.set(year, { year });
            }

            const yearData = yearMap.get(year);

            // Update the data based on the metric type
            if (metricType === "funding") {
                // Sum funding values
                yearData[categoryValue] =
                    (yearData[categoryValue] || 0) + grantValue;
            } else {
                // Count grants
                yearData[categoryValue] = (yearData[categoryValue] || 0) + 1;
            }
        });

        // Convert to array and sort by year
        const result = Array.from(yearMap.values()).sort(
            (a, b) => a.year - b.year
        );

        // If we have too many categories for readability, limit them
        const categories = Array.from(uniqueCategories);

        // For recipient and institute dimensions, limit to top 8 by value
        if (
            (groupingDimension === "recipient" ||
                groupingDimension === "institute") &&
            categories.length > 8
        ) {
            // Aggregate values across all years for each category
            const categoryTotals = new Map();

            // Sum up values for each category
            result.forEach((yearData) => {
                categories.forEach((category) => {
                    if (yearData[category]) {
                        categoryTotals.set(
                            category,
                            (categoryTotals.get(category) || 0) +
                                yearData[category]
                        );
                    }
                });
            });

            // Sort categories by total value and take top 8
            const topCategories = [...categoryTotals.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map((entry) => entry[0]);

            // For each year, create an "Other" category for the rest
            result.forEach((yearData) => {
                let otherValue = 0;
                categories.forEach((category) => {
                    if (
                        !topCategories.includes(category) &&
                        yearData[category]
                    ) {
                        otherValue += yearData[category];
                        delete yearData[category];
                    }
                });

                if (otherValue > 0) {
                    yearData["Other"] = otherValue;
                }
            });

            // Update categories list
            topCategories.push("Other");
            return { data: result, categories: topCategories };
        }

        return { data: result, categories: Array.from(uniqueCategories) };
    }, [
        processedGrants,
        groupingDimension,
        metricType,
        isAmendmentView,
        amendmentChartData,
    ]);

    // Render nothing if no data
    if ((!grants || grants.length === 0) && !isAmendmentView) {
        return null;
    }

    // Generate title for the chart
    const chartTitle =
        title || `${metricType === "funding" ? "Funding" : "Grant"} Trends by `;

    // Special title for amendment view
    const effectiveTitle = isAmendmentView
        ? "Grant Amendment History"
        : `${chartTitle}${
              groupingDisplayOptions.find(
                  (opt) => opt.value === groupingDimension
              )?.label || ""
          }`;

    return (
        <Card className={cn("p-6", className)}>
            {/* Header with controls */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                    <h3 className="text-lg lg:text-lg font-medium whitespace-nowrap">
                        {effectiveTitle}
                    </h3>
                    {/* Dropdown for dimension selection - only show if not amendment view */}
                    {!isAmendmentView && (
                        <Dropdown
                            value={groupingDimension}
                            options={groupingDisplayOptions}
                            onChange={(value) =>
                                setGroupingDimension(value as GroupingDimension)
                            }
                            className="min-w-[150px]"
                        />
                    )}
                </div>

                <div className="flex items-center justify-between w-full py-2 lg:py-0 lg:gap-3 lg:justify-end">
                    {/* Metric type toggle (if multiple metrics available and not in amendment view) */}
                    {availableMetrics.length > 1 && !isAmendmentView && (
                        <div className="flex rounded-md shadow-sm">
                            <button
                                onClick={() => setMetricType("funding")}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium border rounded-l-md flex items-center gap-1",
                                    metricType === "funding"
                                        ? "bg-gray-100 text-gray-800 border-gray-300"
                                        : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200"
                                )}
                            >
                                <DollarSign className="h-3.5 w-3.5" />
                                <span className="hidden md:inline">
                                    Funding
                                </span>
                            </button>
                            <button
                                onClick={() => setMetricType("count")}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium border rounded-r-md flex items-center gap-1",
                                    metricType === "count"
                                        ? "bg-gray-100 text-gray-800 border-gray-300"
                                        : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200"
                                )}
                            >
                                <Hash className="h-3.5 w-3.5" />
                                <span className="hidden md:inline">Count</span>
                            </button>
                        </div>
                    )}

                    {/* Chart type toggle */}
                    <div className="flex rounded-md shadow-sm">
                        <button
                            onClick={() => setChartType("line")}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium border flex items-center gap-1",
                                chartType === "line"
                                    ? "bg-gray-100 text-gray-800 border-gray-300"
                                    : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200",
                                "rounded-l-md"
                            )}
                        >
                            <LineChart className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">Line</span>
                        </button>
                        <button
                            onClick={() => setChartType("bar-stacked")}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium border flex items-center gap-1",
                                chartType === "bar-stacked"
                                    ? "bg-gray-100 text-gray-800 border-gray-300"
                                    : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200"
                            )}
                        >
                            <BarChart className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">Stacked</span>
                        </button>
                        <button
                            onClick={() => setChartType("bar-grouped")}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium border flex items-center gap-1",
                                chartType === "bar-grouped"
                                    ? "bg-gray-100 text-gray-800 border-gray-300"
                                    : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200",
                                "rounded-r-md"
                            )}
                        >
                            <BarChart2 className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">Grouped</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Chart display - only show if we have data */}
            {chartData.data.length > 0 && chartData.categories.length > 0 ? (
                <div style={{ height: `${height}px` }}>
                    <DataChart
                        data={chartData.data}
                        chartType={chartType === "line" ? "line" : "bar"}
                        dataType={
                            metricType === "funding" ? "funding" : "counts"
                        }
                        categories={chartData.categories}
                        height={height}
                        stacked={chartType === "bar-stacked"}
                        // Special option for amendment view to format x-axis differently
                        isAmendmentView={isAmendmentView}
                    />
                </div>
            ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg text-gray-500">
                    No data available for the selected visualization
                </div>
            )}

            {/* Legend for top categories */}
            {chartData.categories.length > 0 && (
                <div className="flex flex-wrap justify-center mt-4 gap-3">
                    {isAmendmentView
                        ? Object.entries(AMENDMENT_COLORS).map(([key, color], index) => (
                            <div className="flex items-center text-xs" key={index}>
                                <span
                                    className="w-3 h-3 rounded-full mr-1.5"
                                    style={{
                                        backgroundColor: color,
                                    }}
                                />
                                <span className="text-gray-600">{key}</span>
                            </div>
                        ))
                        : chartData.categories.map((category, index) => (
                            <div
                                key={category}
                                className="flex items-center text-xs"
                            >
                                <span
                                    className="w-3 h-3 rounded-full mr-1.5"
                                    style={{
                                        backgroundColor: getCategoryColor(
                                            category,
                                            index
                                        ),
                                    }}
                                />
                                <span className="text-gray-600">{category}</span>
                            </div>
                        ))}
                </div>
            )}
        </Card>
    );
};
