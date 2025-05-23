// src/utils/chartDataTransforms.ts
import { Grant } from "@/types/models";

export interface ChartDataPoint {
    [key: string]: any;
}

/**
 * Transforms grant data into yearly aggregated data for charts
 *
 * @param grants - Array of grants
 * @param metric - Type of metric to aggregate (funding or counts)
 * @param groupBy - Field to group data by
 * @returns Array of data points with yearly aggregated values
 */
export function transformGrantsToYearlyData(
    grants: Grant[],
    metric: "funding" | "counts",
    groupBy: string = "org"
): ChartDataPoint[] {
    // Validate inputs
    if (!grants || !Array.isArray(grants) || grants.length === 0) {
        console.warn(
            "transformGrantsToYearlyData: No valid grants data provided"
        );
        return [];
    }

    // Create a map to store data for each year
    const yearlyData: Record<number, Record<string, number>> = {};

    // Process each grant
    grants.forEach((grant) => {
        // Skip invalid grants
        if (!grant || typeof grant !== "object") {
            return;
        }

        // Skip grants with missing date
        if (!grant.agreement_start_date) {
            return;
        }

        // Extract year, ensuring it's a valid number
        let year: number;
        try {
            year = new Date(grant.agreement_start_date).getFullYear();
            if (isNaN(year)) {
                return;
            }
        } catch (e) {
            return;
        }

        // Get the value for grouping
        const categoryRaw = grant[groupBy as keyof Grant];
        const category = String(categoryRaw || "Unknown");

        // Handle special case for program names
        const processedCategory =
            groupBy === "prog_id" && grant.prog_title_en
                ? grant.prog_title_en
                : category;

        // Initialize year data if not exists
        if (!yearlyData[year]) {
            yearlyData[year] = { year };
        }

        // Initialize category if not exists
        if (!yearlyData[year][processedCategory]) {
            yearlyData[year][processedCategory] = 0;
        }

        // Add the appropriate value
        if (metric === "funding") {
            // Ensure agreement_value is a valid number
            const value = Number(grant.agreement_value);
            yearlyData[year][processedCategory] += isNaN(value) ? 0 : value;
        } else {
            // 'counts'
            yearlyData[year][processedCategory] += 1;
        }
    });

    // Convert to array and sort by year
    return Object.values(yearlyData).sort((a, b) => a.year - b.year);
}

/**
 * Extracts unique categories from chart data
 *
 * @param data - Array of chart data points
 * @returns Array of unique category names
 */
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

/**
 * Formats chart values based on type
 *
 * @param value - Numeric value to format
 * @param type - Type of value (funding or counts)
 * @returns Formatted string representation
 */
export function formatChartValue(
    value: number,
    type: "funding" | "counts"
): string {
    if (type === "funding") {
        if (value >= 1_000_000_000) {
            return `$${(value / 1_000_000_000).toFixed(1)}B`;
        } else if (value >= 1_000_000) {
            return `$${(value / 1_000_000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`;
        }
        return `$${value.toFixed(0)}`;
    } else {
        return Math.round(value).toString();
    }
}
