// src/components/features/visualizations/AnalyticsChart.tsx
import DataChart from "./DataChart";
import { ChartType, ChartMetric } from "@/types/search";
import { Card } from "@/components/common/ui/Card";

interface AnalyticsChartProps {
    chartType: ChartType;
    chartMetric: ChartMetric;
    analyticsData: {
        fundingByYear: any[];
        grantsByYear: any[];
    };
    agencies: string[];
    className?: string;
}

const AnalyticsChart = ({
    chartType,
    chartMetric,
    analyticsData,
    agencies,
    className,
}: AnalyticsChartProps) => {
    return (
        <Card className={`p-4 ${className || ""}`}>
            <DataChart
                data={
                    chartMetric === "funding"
                        ? analyticsData.fundingByYear
                        : analyticsData.grantsByYear
                }
                chartType={chartType}
                dataType={chartMetric === "funding" ? "funding" : "counts"}
                categories={agencies}
                height={300}
                stacked={chartType === "bar"}
            />
        </Card>
    );
};

export default AnalyticsChart;
