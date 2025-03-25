// src/components/features/visualizations/DataChart.tsx
import React from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { ChartDataPoint, formatChartValue } from "@/utils/chartDataTransforms";
import { getCategoryColor, AMENDMENT_COLORS } from "@/utils/chartColors";
import CustomTooltip from "./CustomTooltip";

export interface DataChartProps {
    data: ChartDataPoint[];
    chartType: "line" | "bar";
    dataType: "funding" | "counts";
    categories: string[];
    height?: number;
    stacked?: boolean;
    showLegend?: boolean;
    showGrid?: boolean;
    title?: string;
    className?: string;
    isAmendmentView?: boolean; // New prop for amendment visualizations
}

export const DataChart: React.FC<DataChartProps> = ({
    data,
    chartType,
    dataType,
    categories,
    height = 400,
    stacked = false,
    showLegend = false,
    showGrid = true,
    title,
    className,
    isAmendmentView = false,
}) => {
    // Special formatting for amendment dates
    const formatXAxis = (value: string) => {
        if (isAmendmentView && value.includes("-")) {
            // For amendment dates, format as MM/YY
            const parts = value.split("-");
            if (parts.length >= 2) {
                const year = parts[0];
                const month = parts[1];
                return `${month}/${year.slice(2)}`;
            }
        }
        return value;
    };

    return (
        <div className={className}>
            {title && <h3 className="text-md font-medium mb-3">{title}</h3>}
            <div style={{ height: `${height}px`, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === "line" ? (
                        <LineChart
                            data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                        >
                            {showGrid && (
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                />
                            )}
                            <XAxis
                                dataKey="year"
                                tickLine={false}
                                axisLine={{ stroke: "#e5e7eb" }}
                                tick={{ fontSize: 11 }}
                                tickFormatter={formatXAxis}
                                angle={isAmendmentView ? -30 : 0}
                            />
                            <YAxis
                                tickFormatter={(value) =>
                                    formatChartValue(value, dataType)
                                }
                                tickLine={false}
                                axisLine={{ stroke: "#e5e7eb" }}
                                tick={{ fontSize: 11 }}
                            />
                            <Tooltip
                                content={
                                    <CustomTooltip chartMetric={dataType} />
                                }
                            />
                            {showLegend && <Legend />}

                            {categories.map((category, index) => (
                                <Line
                                    key={category}
                                    type="monotone"
                                    dataKey={category}
                                    name={category}
                                    stroke={getCategoryColor(category, index)}
                                    strokeWidth={2}
                                    dot={
                                        isAmendmentView
                                            ? // For amendment view, customize each dot based on version
                                              ({ cx, cy, payload }) => {
                                                  // Determine color based on amendment number, isInitial flag, and isFinal flag
                                                  let color =
                                                      AMENDMENT_COLORS.Original;

                                                  if (
                                                      payload?.amendmentNumber ===
                                                      0
                                                  ) {
                                                      color =
                                                          AMENDMENT_COLORS.Original;
                                                  } else if (payload?.isFinal) {
                                                      color =
                                                          AMENDMENT_COLORS.Final;
                                                  } else {
                                                      color =
                                                          AMENDMENT_COLORS.Amendment;
                                                  }

                                                  return (
                                                      <circle
                                                          cx={cx}
                                                          cy={cy}
                                                          r={5}
                                                          fill={color}
                                                          stroke="none"
                                                      />
                                                  );
                                              }
                                            : // Standard dots for regular charts
                                              {
                                                  r: 4,
                                                  fill: getCategoryColor(
                                                      category,
                                                      index
                                                  ),
                                                  strokeWidth: 0,
                                              }
                                    }
                                    activeDot={{
                                        r: 6,
                                        stroke: getCategoryColor(
                                            category,
                                            index
                                        ),
                                        strokeWidth: 1,
                                        fill: "#fff",
                                    }}
                                />
                            ))}
                        </LineChart>
                    ) : (
                        <BarChart
                            data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                            // Only use multi-bar layout for grouped bars
                            barCategoryGap={stacked ? "10%" : "20%"}
                            barGap={stacked ? 0 : 4}
                        >
                            {showGrid && (
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                />
                            )}
                            <XAxis
                                dataKey="year"
                                tickLine={false}
                                axisLine={{ stroke: "#e5e7eb" }}
                                tick={{ fontSize: 11 }}
                                tickFormatter={formatXAxis}
                                angle={isAmendmentView ? -30 : 0}
                            />
                            <YAxis
                                tickFormatter={(value) =>
                                    formatChartValue(value, dataType)
                                }
                                tickLine={false}
                                axisLine={{ stroke: "#e5e7eb" }}
                                tick={{ fontSize: 11 }}
                            />
                            <Tooltip
                                content={
                                    <CustomTooltip chartMetric={dataType} />
                                }
                            />
                            {showLegend && <Legend />}

                            {categories.map((category, index) => {
                                // For amendment view, we'll use special colors based on the version
                                const isAmendmentBar = isAmendmentView;

                                // Regular bar element
                                return (
                                    <Bar
                                        key={category}
                                        dataKey={category}
                                        name={category}
                                        stackId={stacked ? "a" : undefined}
                                        fill={getCategoryColor(category, index)}
                                        // Add rounded corners for bars
                                        radius={
                                            stacked
                                                ? [0, 0, 0, 0]
                                                : [4, 4, 0, 0]
                                        }
                                        // Make bars slightly transparent in grouped mode for better visual distinction
                                        fillOpacity={stacked ? 1 : 0.9}
                                    >
                                        {/* For amendment view, color code bars based on version */}
                                        {isAmendmentBar &&
                                            data.map((_, i) => {
                                                let color =
                                                    AMENDMENT_COLORS.Original;

                                                // Original is blue, amendments are amber, current is green
                                                if (
                                                    data[i]?.amendmentNumber ===
                                                    0
                                                ) {
                                                    color =
                                                        AMENDMENT_COLORS.Original;
                                                } else if (data[i]?.isFinal) {
                                                    color =
                                                        AMENDMENT_COLORS.Final;
                                                } else {
                                                    color =
                                                        AMENDMENT_COLORS.Amendment;
                                                }

                                                return (
                                                    <Cell
                                                        key={`cell-${i}`}
                                                        fill={color}
                                                    />
                                                );
                                            })}
                                    </Bar>
                                );
                            })}
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DataChart;
