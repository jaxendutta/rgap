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
} from "recharts";
import { ChartDataPoint, formatChartValue } from "@/utils/chartDataTransforms";
import { getCategoryColor } from "@/utils/chartColors";

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
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    dataType: "funding" | "counts";
}

// Custom tooltip component
const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
    dataType,
}) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
                <p className="font-medium text-sm">{label}</p>
                <div className="mt-2 space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <p
                            key={index}
                            className="text-sm flex items-center gap-2"
                        >
                            <span
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span>
                                {entry.name}:{" "}
                                {dataType === "funding"
                                    ? new Intl.NumberFormat("en-CA", {
                                          style: "currency",
                                          currency: "CAD",
                                          maximumFractionDigits: 0,
                                      }).format(entry.value)
                                    : `${Math.round(entry.value)} ${
                                          entry.value === 1 ? "grant" : "grants"
                                      }`}
                            </span>
                        </p>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

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
}) => {
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
                                content={<CustomTooltip dataType={dataType} />}
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
                                    dot={{
                                        r: 4,
                                        fill: getCategoryColor(category, index),
                                        strokeWidth: 0,
                                    }}
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
                                content={<CustomTooltip dataType={dataType} />}
                            />
                            {showLegend && <Legend />}

                            {categories.map((category, index) => (
                                <Bar
                                    key={category}
                                    dataKey={category}
                                    name={category}
                                    stackId={stacked ? "a" : undefined}
                                    fill={getCategoryColor(category, index)}
                                    // Add rounded corners for bars
                                    radius={
                                        stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]
                                    }
                                    // Make bars slightly transparent in grouped mode for better visual distinction
                                    fillOpacity={stacked ? 1 : 0.9}
                                />
                            ))}
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DataChart;
