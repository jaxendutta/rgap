// src/components/common/ui/ChartControls.tsx
import { cn } from "@/utils/cn";
import { LucideIcon, LineChart, BarChart } from "lucide-react";
import { ChartType, ChartMetric } from "@/types/search";

interface MetricOption {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface ChartControlsProps {
    chartType: ChartType;
    setChartType: (type: ChartType) => void;
    chartMetric: ChartMetric;
    setChartMetric: (metric: ChartMetric) => void;
    metrics: MetricOption[];
    className?: string;
}

export const ChartControls = ({
    chartType,
    setChartType,
    chartMetric,
    setChartMetric,
    metrics,
    className,
}: ChartControlsProps) => {
    return (
        <div className={cn("flex flex-wrap gap-2 items-center", className)}>
            {/* Metric toggle */}
            {metrics.length > 1 && (
                <div
                    className="inline-flex rounded-md shadow-sm mr-2"
                    role="group"
                >
                    {metrics.map((metric, index) => {
                        const Icon = metric.icon;
                        return (
                            <button
                                key={metric.id}
                                type="button"
                                onClick={() => setChartMetric(metric.id as ChartMetric)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium border border-gray-200",
                                    index === 0
                                        ? "rounded-l-lg"
                                        : index === metrics.length - 1
                                        ? "rounded-r-lg"
                                        : "",
                                    chartMetric === metric.id
                                        ? "bg-gray-100 text-gray-900"
                                        : "bg-white text-gray-500 hover:bg-gray-50"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5 inline-block mr-1" />
                                {metric.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Chart style toggle */}
            <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                    type="button"
                    onClick={() => setChartType("line")}
                    className={cn(
                        "px-3 py-1 text-xs font-medium border border-gray-200 rounded-l-lg",
                        chartType === "line"
                            ? "bg-gray-100 text-gray-900"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                    )}
                >
                    <LineChart className="h-3.5 w-3.5 inline-block mr-1" />
                    Line
                </button>
                <button
                    type="button"
                    onClick={() => setChartType("bar")}
                    className={cn(
                        "px-3 py-1 text-xs font-medium border border-gray-200 rounded-r-lg",
                        chartType === "bar"
                            ? "bg-gray-100 text-gray-900"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                    )}
                >
                    <BarChart className="h-3.5 w-3.5 inline-block mr-1" />
                    Bar
                </button>
            </div>
        </div>
    );
};
