// src/components/features/visualizations/TrendVisualizer.tsx
import { Dropdown } from "@/components/common/ui/Dropdown";
import { Card } from "@/components/common/ui/Card";
import DataChart from "./DataChart";
import { extractCategories } from "@/utils/chartDataTransforms";

interface TrendVisualizerProps {
    data: any[];
    groupBy: string;
    onGroupByChange: (value: string) => void;
    groupByOptions: Array<{ value: string; label: string }>;
    chartType?: "line" | "bar";
}

export const TrendVisualizer = ({
    data,
    groupBy,
    onGroupByChange,
    groupByOptions,
    chartType = "line",
}: TrendVisualizerProps) => {
    // Extract categories from data
    const categories = extractCategories(data);

    return (
        <Card className="p-4 lg:p-6">
            {/* Header with Dropdown */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <h3 className="text-lg font-medium whitespace-nowrap">
                    Funding Trends by
                </h3>
                <Dropdown
                    value={groupBy}
                    options={groupByOptions}
                    onChange={onGroupByChange}
                    className="w-40"
                />
            </div>

            {/* Chart Container using our new DataChart component */}
            <DataChart
                data={data}
                chartType={chartType}
                dataType="funding"
                categories={categories}
                height={300}
            />
        </Card>
    );
};
