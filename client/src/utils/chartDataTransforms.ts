// src/utils/chartDataTransforms.ts
import { ResearchGrant } from "../types/models";

export interface ChartDataPoint {
    [key: string]: any;
}

export function transformGrantsToYearlyData(
    grants: ResearchGrant[],
    metric: "funding" | "counts",
    groupBy: string = "org"
): ChartDataPoint[] {
    // Create a map to store data for each year
    const yearlyData: Record<number, Record<string, number>> = {};

    // Process each grant
    grants.forEach((grant) => {
        const year = new Date(grant.agreement_start_date).getFullYear();
        const category = String(
            grant[groupBy as keyof ResearchGrant] || "Unknown"
        );

        // Initialize year data if not exists
        if (!yearlyData[year]) {
            yearlyData[year] = { year };
        }

        // Initialize category if not exists
        if (!yearlyData[year][category]) {
            yearlyData[year][category] = 0;
        }

        // Add the appropriate value
        if (metric === "funding") {
            yearlyData[year][category] += Number(grant.agreement_value) || 0;
        } else {
            // 'counts'
            yearlyData[year][category] += 1;
        }
    });

    // Convert to array and sort by year
    return Object.values(yearlyData).sort((a, b) => a.year - b.year);
}

export function extractCategories(data: ChartDataPoint[]): string[] {
    const categories = new Set<string>();

    data.forEach((point) => {
        Object.keys(point).forEach((key) => {
            if (key !== "year" && typeof key === "string") {
                categories.add(key);
            }
        });
    });

    return Array.from(categories);
}

export function formatChartValue(
    value: number,
    type: "funding" | "counts"
): string {
    if (type === "funding") {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}k`;
        }
        return `$${value.toFixed(0)}`;
    } else {
        return Math.round(value).toString();
    }
}
