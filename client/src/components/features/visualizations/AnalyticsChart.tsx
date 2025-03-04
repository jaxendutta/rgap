// src/components/features/visualizations/AnalyticsChart.tsx
import CustomTooltip from "@/components/features/visualizations/CustomTooltip";
import { ChartType, ChartMetric } from "@/types/search";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";

// Analytics Chart Component
interface AnalyticsChartProps {
    chartType: ChartType;
    chartMetric: ChartMetric;
    analyticsData: {
        fundingByYear: any[];
        grantsByYear: any[];
    };
    agencies: string[];
}

const AnalyticsChart = ({
    chartType,
    chartMetric,
    analyticsData,
    agencies,
}: AnalyticsChartProps) => {
    // Get colors for chart based on agency name
    const getAgencyColor = (agency: string): string => {
        const colors: Record<string, string> = {
            NSERC: "#2563eb", // blue
            SSHRC: "#7c3aed", // purple
            CIHR: "#059669", // green
        };
        return colors[agency] || "#6b7280"; // gray as fallback
    };

    return (
        <div className="bg-white p-2 lg:p-4 rounded-lg border border-gray-200">
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === "line" ? (
                        <LineChart
                            data={
                                chartMetric === "funding"
                                    ? analyticsData.fundingByYear
                                    : analyticsData.grantsByYear
                            }
                            margin={{ top: 10, right: 30, left: 50, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f0f0f0"
                            />
                            <XAxis
                                dataKey="year"
                                tickLine={false}
                                axisLine={{ stroke: "#e5e7eb" }}
                            />
                            <YAxis
                                tickFormatter={(value) => {
                                    if (chartMetric === "funding") {
                                        const millions = value / 1000000;
                                        if (millions >= 1) {
                                            return `${millions.toFixed(1)}M`;
                                        } else {
                                            const thousands = value / 1000;
                                            return `${thousands.toFixed(0)}k`;
                                        }
                                    } else {
                                        return Math.round(value).toString();
                                    }
                                }}
                                tickLine={false}
                                axisLine={{ stroke: "#e5e7eb" }}
                                tick={{ fontSize: 12 }}
                                tickMargin={8}
                            />
                            <Tooltip
                                content={
                                    <CustomTooltip chartMetric={chartMetric} />
                                }
                            />
                            <Legend />

                            {/* Create a line for each agency */}
                            {agencies.map((agency) => (
                                <Line
                                    key={agency}
                                    type="monotone"
                                    dataKey={agency}
                                    name={agency}
                                    stroke={getAgencyColor(agency)}
                                    strokeWidth={2}
                                    dot={{
                                        r: 4,
                                        fill: getAgencyColor(agency),
                                        strokeWidth: 0,
                                    }}
                                    activeDot={{
                                        r: 6,
                                        stroke: getAgencyColor(agency),
                                        strokeWidth: 1,
                                        fill: "#fff",
                                    }}
                                />
                            ))}
                        </LineChart>
                    ) : (
                        <BarChart
                            data={
                                chartMetric === "funding"
                                    ? analyticsData.fundingByYear
                                    : analyticsData.grantsByYear
                            }
                            margin={{ top: 10, right: 30, left: 50, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f0f0f0"
                            />
                            <XAxis
                                dataKey="year"
                                tickLine={false}
                                axisLine={{ stroke: "#e5e7eb" }}
                            />
                            <YAxis
                                tickFormatter={(value) => {
                                    if (chartMetric === "funding") {
                                        const millions = value / 1000000;
                                        if (millions >= 1) {
                                            return `${millions.toFixed(1)}M`;
                                        } else {
                                            const thousands = value / 1000;
                                            return `${thousands.toFixed(0)}k`;
                                        }
                                    } else {
                                        return Math.round(value).toString();
                                    }
                                }}
                                tickLine={false}
                                axisLine={{ stroke: "#e5e7eb" }}
                                tick={{ fontSize: 12 }}
                                tickMargin={8}
                            />
                            <Tooltip
                                content={
                                    <CustomTooltip chartMetric={chartMetric} />
                                }
                            />
                            <Legend />

                            {/* Create a bar for each agency */}
                            {agencies.map((agency) => (
                                <Bar
                                    key={agency}
                                    dataKey={agency}
                                    name={agency}
                                    stackId="a"
                                    fill={getAgencyColor(agency)}
                                />
                            ))}
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnalyticsChart;
