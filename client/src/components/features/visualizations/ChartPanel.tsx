// src/components/features/visualizations/ChartPanel.tsx
import React, { useState } from "react";
import {
    LineChart as LineChartIcon,
    BarChart as BarChartIcon,
    DollarSign,
    Hash,
    TrendingUp,
} from "lucide-react";
import { Card } from "@/components/common/ui/Card";
import DataChart from "./DataChart";
import { ChartType, ChartMetric } from "@/types/search";
import { extractCategories } from "@/utils/chartDataTransforms";

export interface ChartPanelProps {
    data: {
        fundingByYear?: any[];
        grantsByYear?: any[];
        countsByYear?: any[];
    };
    title?: string;
    description?: string;
    initialChartType?: ChartType;
    initialMetric?: ChartMetric;
    categories?: string[];
    showControls?: boolean;
    height?: number;
    className?: string;
}

const ChartPanel: React.FC<ChartPanelProps> = ({
    data,
    title = "Analytics",
    description,
    initialChartType = "bar",
    initialMetric = "funding",
    categories,
    showControls = true,
    height = 400,
    className,
}) => {
    const [chartType, setChartType] = useState<ChartType>(initialChartType);
    const [chartMetric, setChartMetric] = useState<ChartMetric>(initialMetric);

    // Determine which dataset to use based on the selected metric
    const getChartData = () => {
        switch (chartMetric) {
            case "funding":
                return data.fundingByYear || [];
            case "grants":
                return data.grantsByYear || [];
            case "counts":
                return data.countsByYear || [];
            default:
                return data.fundingByYear || [];
        }
    };

    // Define available metrics based on the data provided
    const availableMetrics = [
        ...(data.fundingByYear
            ? [
                  {
                      id: "funding" as ChartMetric,
                      label: "Funding",
                      icon: DollarSign,
                  },
              ]
            : []),
        ...(data.grantsByYear
            ? [{ id: "grants" as ChartMetric, label: "Grants", icon: Hash }]
            : []),
        ...(data.countsByYear
            ? [
                  {
                      id: "counts" as ChartMetric,
                      label: "Counts",
                      icon: TrendingUp,
                  },
              ]
            : []),
    ];

    // Extract categories from data if not provided
    const derivedCategories = categories || extractCategories(getChartData());

    // Check if we have data to display
    const hasData = derivedCategories.length > 0 && getChartData().length > 0;

    // Config for chart controls
    const chartTypes = [
        { id: "line" as ChartType, label: "Line", icon: LineChartIcon },
        { id: "bar" as ChartType, label: "Bar", icon: BarChartIcon },
    ];

    return (
        <Card className={className}>
            <Card.Header
                title={title}
                subtitle={description}
                action={
                    showControls && hasData ? (
                        <div className="flex items-center space-x-2">
                            {availableMetrics.length > 1 && (
                                <div className="flex rounded-md shadow-sm">
                                    {availableMetrics.map((metric) => {
                                        const Icon = metric.icon;
                                        return (
                                            <button
                                                key={metric.id}
                                                type="button"
                                                onClick={() =>
                                                    setChartMetric(metric.id)
                                                }
                                                className={`px-3 py-1 text-xs font-medium border ${
                                                    chartMetric === metric.id
                                                        ? "bg-gray-100 text-gray-900"
                                                        : "bg-white text-gray-500 hover:bg-gray-50"
                                                } ${
                                                    metric.id ===
                                                    availableMetrics[0].id
                                                        ? "rounded-l-md"
                                                        : ""
                                                } ${
                                                    metric.id ===
                                                    availableMetrics[
                                                        availableMetrics.length -
                                                            1
                                                    ].id
                                                        ? "rounded-r-md"
                                                        : ""
                                                }`}
                                            >
                                                <Icon className="h-3.5 w-3.5 inline-block mr-1" />
                                                {metric.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="flex rounded-md shadow-sm">
                                {chartTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() =>
                                                setChartType(type.id)
                                            }
                                            className={`px-3 py-1 text-xs font-medium border ${
                                                chartType === type.id
                                                    ? "bg-gray-100 text-gray-900"
                                                    : "bg-white text-gray-500 hover:bg-gray-50"
                                            } ${
                                                type.id === "line"
                                                    ? "rounded-l-md"
                                                    : ""
                                            } ${
                                                type.id === "bar"
                                                    ? "rounded-r-md"
                                                    : ""
                                            }`}
                                        >
                                            <Icon className="h-3.5 w-3.5 inline-block mr-1" />
                                            {type.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null
                }
            />

            <Card.Content noPadding>
                {hasData ? (
                    <DataChart
                        data={getChartData()}
                        chartType={chartType}
                        dataType={
                            chartMetric === "funding" ? "funding" : "counts"
                        }
                        categories={derivedCategories}
                        height={height}
                        stacked={chartType === "bar"}
                    />
                ) : (
                    <div className="flex items-center justify-center p-8 h-64">
                        <p className="text-gray-500">
                            No data available for visualization
                        </p>
                    </div>
                )}
            </Card.Content>
        </Card>
    );
};

export default ChartPanel;
