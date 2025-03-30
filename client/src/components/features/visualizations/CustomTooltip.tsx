// src/components/features/visualizations/CustomTooltip.tsx
import React from "react";
import { formatCurrency } from "@/utils/format";
import { ChartMetric } from "@/types/search";

// Custom tooltip for charts
interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    chartMetric: ChartMetric;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
    chartMetric,
}) => {
    if (active && payload && payload.length) {
        // Check if this is an amendment visualization (has version, percentChange properties)
        const isAmendmentView =
            payload[0].payload &&
            ("version" in payload[0].payload ||
                "percentChange" in payload[0].payload);

        // For amendment view, display the version name
        const versionName =
            isAmendmentView && payload[0].payload.version
                ? payload[0].payload.version
                : null;

        return (
            <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
                {/* Header with date/label */}
                <p className="font-medium text-sm">{versionName || label}</p>

                {/* Date information for amendment view */}
                {isAmendmentView && payload[0].payload.displayDate && (
                    <p className="text-sm text-gray-700">
                        {payload[0].payload.displayDate}
                    </p>
                )}

                {/* Data points */}
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
                                {/* Don't repeat name for amendment view if we're showing the version in the header */}
                                {(!isAmendmentView || !versionName) &&
                                    `${entry.name}: `}

                                {chartMetric === "funding"
                                    ? formatCurrency(entry.value)
                                    : `${Math.round(
                                          entry.value
                                      ).toLocaleString()} ${
                                          entry.value === 1 ? "grant" : "grants"
                                      }`}
                            </span>
                        </p>
                    ))}
                </div>

                {/* Percent change for amendment view */}
                {isAmendmentView &&
                    payload[0].payload.percentChange !== undefined &&
                    payload[0].payload.percentChange !== 0 && (
                        <p
                            className={`text-xs mt-1 ${
                                Number(payload[0].payload.percentChange) > 0
                                    ? "text-green-600"
                                    : "text-amber-600"
                            }`}
                        >
                            {Number(payload[0].payload.percentChange) > 0
                                ? "+"
                                : ""}
                            {Number(payload[0].payload.percentChange).toFixed(
                                1
                            )}
                            % from previous
                        </p>
                    )}
            </div>
        );
    }
    return null;
};

export default CustomTooltip;
