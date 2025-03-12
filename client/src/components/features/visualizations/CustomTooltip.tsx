// src/components/features/visualizations/CustomTooltip.tsx
import React from 'react';
import { formatCurrency } from '@/utils/format';
import { ChartMetric } from '@/types/search';

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
                                {chartMetric === "funding"
                                    ? `${entry.name}: ${formatCurrency(
                                          entry.value
                                      )}`
                                    : `${entry.name}: ${Math.round(
                                          entry.value
                                      )} grants`}
                            </span>
                        </p>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default CustomTooltip;
