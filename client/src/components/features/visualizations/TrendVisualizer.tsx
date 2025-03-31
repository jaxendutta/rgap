// src/components/features/visualizations/TrendVisualizer.tsx
import React, { useState, useMemo } from "react";
import {
    DollarSign,
    Hash,
    ChartColumnStacked,
    ChartColumn,
    ChartSpline,
    Activity,
    Landmark,
    GraduationCap,
    Calendar,
    BookOpen,
    LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Grant, GrantAmendment } from "@/types/models";
import { Card } from "@/components/common/ui/Card";
import { Dropdown } from "@/components/common/ui/Dropdown";
import DataChart from "@/components/features/visualizations/DataChart";
import { AMENDMENT_COLORS, getCategoryColor } from "@/utils/chartColors";
import Button from "@/components/common/ui/Button";
import ToggleButtons from "@/components/common/ui/ToggleButtons";
import LoadingState from "@/components/common/ui/LoadingState";
import { formatSentenceCase } from "@/utils/format";

export type ChartType = "line" | "stacked" | "grouped";
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

interface TrendVisualizerProps {
    // The grants data to visualize
    grants?: Grant[];
    entityId?: number;
    entityType?: "recipient" | "institute";

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
    icon?: LucideIcon;
    showControls?: boolean;
}

// Get the icon for each grouping dimension
const getGroupingIcon = (dimension: GroupingDimension): React.ElementType => {
    const iconMap: Record<GroupingDimension, React.ElementType> = {
        org: Landmark,
        city: GraduationCap,
        province: GraduationCap,
        country: GraduationCap,
        recipient: GraduationCap,
        institute: Landmark,
        program: BookOpen,
        year: Calendar,
        amendment: Activity,
    };

    return iconMap[dimension] || Activity;
};

// Default groupings based on context
const getDefaultGroupings = (viewContext: ViewContext): GroupingDimension[] => {
    switch (viewContext) {
        case "recipient":
            return ["org", "program", "year"];
        case "institute":
            return ["org", "program", "recipient", "year"];
        case "search":
        default:
            return [
                "org",
                "city",
                "province",
                "country",
                "recipient",
                "institute",
            ];
    }
};

export const TrendVisualizer: React.FC<TrendVisualizerProps> = ({
    grants = [],
    amendmentsHistory,
    viewContext = "search",
    initialChartType = "line",
    initialMetricType = "funding",
    initialGrouping,
    availableGroupings: propsAvailableGroupings,
    availableMetrics = ["funding", "count"],
    height = 400,
    className,
    title = "Trend Visualizer",
    icon = Activity,
    showControls = true,
}) => {
    // Check if the data is empty
    const hasData =
        grants.length > 0 ||
        (amendmentsHistory && amendmentsHistory.length > 0);

    // Determine if we're visualizing a single grant's amendments
    const isAmendmentView = !!amendmentsHistory && amendmentsHistory.length > 0;

    // Get appropriate available groupings
    const effectiveAvailableGroupings = useMemo(() => {
        if (isAmendmentView) {
            return ["amendment"];
        }
        return propsAvailableGroupings || getDefaultGroupings(viewContext);
    }, [isAmendmentView, propsAvailableGroupings, viewContext]);

    // Initialize state for chart configuration
    const [chartType, setChartType] = useState<ChartType>(initialChartType);
    const [metricType, setMetricType] = useState<MetricType>(initialMetricType);
    const [groupingDimension, setGroupingDimension] =
        useState<GroupingDimension>(
            initialGrouping ||
                (effectiveAvailableGroupings[0] as GroupingDimension)
        );

    // Add loading and error states
    const [isLoading] = useState(false);
    const [error] = useState<string | null>(null);

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
            icon: getGroupingIcon(option as GroupingDimension),
        }));
    }, [effectiveAvailableGroupings]);

    // Prepare data for amendment visualization if needed
    const amendmentChartData = useMemo(() => {
        if (!isAmendmentView) return null;

        // Create chronological order for the chart (oldest to newest)
        const chronologicalAmendments = [...amendmentsHistory].sort((a, b) => {
            return a.amendment_number - b.amendment_number;
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
                    amendment.amendment_number === 0
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

                // Determine initial and final amendments
                const isInitialAmendment = index === 0;
                const isFinalAmendment =
                    index === chronologicalAmendments.length - 1;

                return {
                    year: formattedDate, // Use year for the x-axis key
                    Funding: amendment.agreement_value, // Use a single 'Funding' category for line chart
                    value: amendment.agreement_value, // For direct value access
                    version: versionLabel, // Store version label for reference
                    percentChange: percentChange, // Store the percent change
                    displayDate: formattedDate, // For tooltip
                    amendmentNumber: amendment.amendment_number, // For coloring
                    isFinal: isFinalAmendment, // Flag for showing green color on final amendment
                    isInitial: isInitialAmendment, // Flag for initial amendment
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

                // Create label - if amendment 0 is missing, mark the first one as "Initial Amendment"
                const isInitialAmendment = index === 0;
                const isOriginalAgreement = amendment.amendment_number === 0;

                const versionLabel = isOriginalAgreement
                    ? "Original"
                    : isInitialAmendment && !isOriginalAgreement
                    ? "Initial Amendment"
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

                // Determine if this is the final amendment
                const isFinalAmendment =
                    index === chronologicalAmendments.length - 1;

                return {
                    year: formattedDate, // Use year for the x-axis key
                    [versionLabel]: amendment.agreement_value, // Use version label as the category
                    value: amendment.agreement_value, // For direct value access
                    version: versionLabel, // Store version label for reference
                    percentChange: percentChange, // Store the percent change
                    displayDate: formattedDate, // For tooltip
                    amendmentNumber: amendment.amendment_number, // For coloring
                    isFinal: isFinalAmendment, // Flag for showing green color on final amendment
                    isInitial: isInitialAmendment, // Flag for initial amendment
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
                            key !== "isInitial" &&
                            key !== "isFinal" &&
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
        if (!grants || grants.length === 0) return { data: [], categories: [] };

        const yearMap = new Map();
        const uniqueCategories = new Set<string>();

        // Group data by year and the selected dimension
        grants.forEach((grant) => {
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
                // Sum funding values - ensure numeric conversion
                yearData[categoryValue] =
                    (Number(yearData[categoryValue]) || 0) + Number(grantValue);
            } else {
                // Count grants
                yearData[categoryValue] =
                    (Number(yearData[categoryValue]) || 0) + 1;
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
                groupingDimension === "institute" ||
                groupingDimension === "program") &&
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
        grants,
        groupingDimension,
        metricType,
        isAmendmentView,
        amendmentChartData,
        chartType,
    ]);

    // If loading, show a loading state
    if (isLoading) {
        return <LoadingState title="Loading visualization data..." size="sm" />;
    }

    // If error, show an error message
    if (error) {
        return <div className="text-red-500 text-sm p-3">{error}</div>;
    }

    // If no data available, show a message
    if (!hasData) {
        return (
            <Card className={cn("p-6", className)}>
                <div className="text-gray-500 text-center py-4">
                    No data available for visualization
                </div>
            </Card>
        );
    }

    // Special title for amendment view
    const effectiveTitle = isAmendmentView
        ? "Grant Amendment History"
        : title ||
          `${metricType === "funding" ? "Funding" : "Grant"} Trends by `;

    return (
        <Card className={cn("", className)}>
            <Card.Header
                icon={icon}
                className="flex flex-col lg:flex-row items-center justify-between gap-3"
                title={effectiveTitle}
            >
                {/* Header with controls - only show if showControls is true */}
                {showControls && !isAmendmentView && (
                    <Dropdown
                        value={groupingDimension}
                        options={groupingDisplayOptions}
                        onChange={(value) =>
                            setGroupingDimension(value as GroupingDimension)
                        }
                        className="min-w-[150px]"
                    />
                )}

                {showControls && (
                    <div className="flex items-center justify-between w-full py-2 lg:py-0 lg:gap-3 lg:justify-end">
                        {/* Metric type toggle (if multiple metrics available and not in amendment view) */}
                        {availableMetrics.length > 1 && !isAmendmentView && (
                            <ToggleButtons>
                                {[
                                    ["funding", DollarSign],
                                    ["count", Hash],
                                ].map(([type, Icon], index) => (
                                    <Button
                                        key={index}
                                        onClick={() =>
                                            setMetricType(type as MetricType)
                                        }
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-medium border flex items-center gap-1",
                                            metricType === type
                                                ? "bg-gray-100 text-gray-800 border-gray-300"
                                                : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200",
                                            index === 0
                                                ? "rounded-l-md"
                                                : index === 1
                                                ? "rounded-r-md"
                                                : ""
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        <span className="hidden md:inline">
                                            {formatSentenceCase(type as string)}
                                        </span>
                                    </Button>
                                ))}
                            </ToggleButtons>
                        )}

                        {/* Chart type toggle */}
                        <ToggleButtons>
                            {[
                                ["line", ChartSpline],
                                ["stacked", ChartColumnStacked],
                                ["grouped", ChartColumn],
                            ].map(([type, Icon], index) => (
                                <Button
                                    key={index}
                                    onClick={() =>
                                        setChartType(type as ChartType)
                                    }
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium border flex items-center gap-1",
                                        chartType === type
                                            ? "bg-gray-100 text-gray-800 border-gray-300"
                                            : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200",
                                        index === 0
                                            ? "rounded-l-md"
                                            : index === 2
                                            ? "rounded-r-md"
                                            : ""
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    <span className="hidden md:inline">
                                        {formatSentenceCase(type as string)}
                                    </span>
                                </Button>
                            ))}
                        </ToggleButtons>
                    </div>
                )}
            </Card.Header>

            <Card.Content>
                {/* Chart display - only show if we have data */}
                {chartData.data.length > 0 &&
                chartData.categories.length > 0 ? (
                    <div style={{ height: `${height}px` }}>
                        <DataChart
                            data={chartData.data}
                            chartType={chartType === "line" ? "line" : "bar"}
                            dataType={
                                metricType === "funding" ? "funding" : "counts"
                            }
                            categories={chartData.categories}
                            height={height}
                            stacked={chartType === "stacked"}
                            showLegend={false}
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
                            ? Object.entries(AMENDMENT_COLORS).map(
                                  ([key, color], index) => (
                                      <div
                                          className="flex items-center text-xs"
                                          key={index}
                                      >
                                          <span
                                              className="w-3 h-3 rounded-full mr-1.5"
                                              style={{
                                                  backgroundColor: color,
                                              }}
                                          />
                                          <span className="text-gray-600">
                                              {key}
                                          </span>
                                      </div>
                                  )
                              )
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
                                      <span className="text-gray-600 max-w-[150px] truncate">
                                          {category}
                                      </span>
                                  </div>
                              ))}
                    </div>
                )}
            </Card.Content>
        </Card>
    );
};

export default TrendVisualizer;
