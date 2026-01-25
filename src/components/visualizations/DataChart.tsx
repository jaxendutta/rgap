// src/components/visualizations/DataChart.tsx
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
import { ChartDataPoint, formatChartValue } from "@/lib/chartDataTransforms";
import { getCategoryColor, AMENDMENT_COLORS } from "@/lib/chartColors";
import CustomTooltip from "./CustomTooltip";
import useResponsive from "@/lib/useResponsive";

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
    isAmendmentView?: boolean;
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
    const screenSize = useResponsive();

    const tickFontSize =
        screenSize === "sm" ? 8 : screenSize === "md" ? 10 : 12;

    const chartMargin =
        screenSize === "sm"
            ? { top: 5, right: 15, left: -15, bottom: 0 }
            : screenSize === "md"
              ? { top: 10, right: 20, left: -10, bottom: 0 }
              : { top: 10, right: 30, left: 0, bottom: 0 };

    const legendIconSize = screenSize === "sm" ? 8 : screenSize === "md" ? 10 : 12;
    const legendFontSize =
        screenSize === "sm" ? "10px" : screenSize === "md" ? "12px" : "14px";

    // Special formatting for amendment dates
    const formatXAxis = (value: string) => {
        if (isAmendmentView && value.includes("-")) {
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
        <div className={`${className} w-full min-w-0 min-h-0`}>
            {title && <h3 className="text-md font-medium mb-3">{title}</h3>}
            {/* minWidth: 0 to prevent Recharts calculation errors */}
            <div style={{ height: `${height}px`, width: "100%", minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === "line" ? (
                        <LineChart
                            data={data}
                            margin={chartMargin}
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
                                tick={{ fontSize: tickFontSize }}
                                tickFormatter={formatXAxis}
                                angle={isAmendmentView ? -30 : 0}
                            />
                            <YAxis
                                tickFormatter={(value) =>
                                    formatChartValue(value, dataType)
                                }
                                tickLine={false}
                                axisLine={{ stroke: "#e5e7eb" }}
                                tick={{ fontSize: tickFontSize }}
                            />
                            <Tooltip
                                content={
                                    <CustomTooltip chartMetric={dataType} />
                                }
                            />
                            {showLegend && (
                                <Legend
                                    iconSize={legendIconSize}
                                    wrapperStyle={{ fontSize: legendFontSize }}
                                />
                            )}

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
                                            ? ({ cx, cy, payload }) => {
                                                let color = AMENDMENT_COLORS.Original;
                                                if (payload?.amendmentNumber === 0) {
                                                    color = AMENDMENT_COLORS.Original;
                                                } else if (payload?.isFinal) {
                                                    color = AMENDMENT_COLORS.Final;
                                                } else {
                                                    color = AMENDMENT_COLORS.Amendment;
                                                }
                                                return (
                                                    <circle cx={cx} cy={cy} r={5} fill={color} stroke="none" />
                                                );
                                            }
                                            : {
                                                r: 4,
                                                fill: getCategoryColor(category, index),
                                                strokeWidth: 0,
                                            }
                                    }
                                    activeDot={{
                                        r: 6,
                                        stroke: getCategoryColor(category, index),
                                        strokeWidth: 1,
                                        fill: "#fff",
                                    }}
                                />
                            ))}
                        </LineChart>
                    ) : (
                        <BarChart
                            data={data}
                            margin={chartMargin}
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
                                tick={{ fontSize: tickFontSize }}
                                tickFormatter={formatXAxis}
                                angle={isAmendmentView ? -30 : 0}
                            />
                            <YAxis
                                tickFormatter={(value) =>
                                    formatChartValue(value, dataType)
                                }
                                tickLine={false}
                                axisLine={{ stroke: "#e5e7eb" }}
                                tick={{ fontSize: tickFontSize }}
                            />
                            <Tooltip
                                content={
                                    <CustomTooltip chartMetric={dataType} />
                                }
                            />
                            {showLegend && (
                                <Legend
                                    iconSize={legendIconSize}
                                    wrapperStyle={{ fontSize: legendFontSize }}
                                />
                            )}

                            {categories.map((category, index) => (
                                <Bar
                                    key={category}
                                    dataKey={category}
                                    name={category}
                                    stackId={stacked ? "a" : undefined}
                                    fill={getCategoryColor(category, index)}
                                    radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                                    fillOpacity={stacked ? 1 : 0.9}
                                >
                                    {isAmendmentView &&
                                        data.map((_, i) => {
                                            let color = AMENDMENT_COLORS.Original;
                                            if (data[i]?.amendmentNumber === 0) {
                                                color = AMENDMENT_COLORS.Original;
                                            } else if (data[i]?.isFinal) {
                                                color = AMENDMENT_COLORS.Final;
                                            } else {
                                                color = AMENDMENT_COLORS.Amendment;
                                            }
                                            return <Cell key={`cell-${i}`} fill={color} />;
                                        })}
                                </Bar>
                            ))}
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DataChart;
