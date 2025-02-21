// src/components/features/grants/SearchResults.tsx
import { useState } from "react";
import { ResearchGrant } from "@/types/models";
import { GrantCard } from "./GrantCard";
import { FileSearch, FileWarning } from "lucide-react";
import { Card } from "@/components/common/ui/Card";
import { LoadingSpinner } from "@/components/common/ui/LoadingSpinner";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

type GroupByOption = "org" | "province" | "country" | "city";

interface SearchResultsProps {
    data?: ResearchGrant[];
    isLoading: boolean;
    error?: Error | null;
    onBookmark?: (grantId: string) => void;
    showVisualization?: boolean;
    isEmptyState?: boolean;
}

const groupByOptions: { value: GroupByOption; label: string }[] = [
    { value: "org", label: "Funding Agency" },
    { value: "province", label: "Province/State" },
    { value: "country", label: "Country" },
    { value: "city", label: "City" },
];

const colors: { [key: string]: string | string[] } = {
    // Default colors for agencies
    NSERC: "#2563eb",
    SSHRC: "#7c3aed",
    CIHR: "#059669",
    // Colors for other categories
    defaultColors: [
        "#2563eb", // blue
        "#7c3aed", // purple
        "#059669", // green
        "#dc2626", // red
        "#ea580c", // orange
        "#0891b2", // cyan
        "#4f46e5", // indigo
        "#be185d", // pink
    ],
};

export const SearchResults = ({
    data,
    isLoading,
    error,
    onBookmark,
    showVisualization,
    isEmptyState = true,
}: SearchResultsProps) => {
    const [groupBy, setGroupBy] = useState<GroupByOption>("org");

    const transformDataForVisualization = (data: ResearchGrant[]) => {
        const yearMap = new Map<
            number,
            { year: number; [key: string]: number }
        >();
        const uniqueCategories = new Set<string>();

        // First pass: collect all unique categories
        data.forEach((result) => {
            if (result[groupBy]) {
                uniqueCategories.add(result[groupBy]);
            }
        });

        // Second pass: aggregate data
        data.forEach((result) => {
            const year = new Date(result.agreement_start_date).getFullYear();
            const value = parseFloat(result.agreement_value.toString()) || 0;
            const category = result[groupBy] || "Unknown";

            if (!yearMap.has(year)) {
                yearMap.set(year, {
                    year,
                    ...Array.from(uniqueCategories).reduce(
                        (acc, cat) => ({
                            ...acc,
                            [cat]: 0,
                        }),
                        {}
                    ),
                });
            }

            const yearData = yearMap.get(year);
            if (yearData && category) {
                yearData[category] = (yearData[category] || 0) + value;
            }
        });

        return Array.from(yearMap.values())
            .sort((a, b) => a.year - b.year)
            .map((entry) => {
                const roundedEntry: { year: number; [key: string]: number } = {
                    year: entry.year,
                };
                Object.keys(entry).forEach((key) => {
                    if (key !== "year") {
                        roundedEntry[key] = Number(entry[key].toFixed(2)) || 0;
                    }
                });
                return roundedEntry;
            });
    };

    if (isEmptyState) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <FileSearch className="h-16 w-16 mb-4" />
                <h3 className="text-xl font-medium mb-2">Ready to Explore?</h3>
                <p className="text-center max-w-md">
                    Type a query above or use filters to begin your exploration.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <LoadingSpinner size="lg" className="mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Searching Grants...
                </h3>
                <p className="text-gray-500">This might take a moment</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-red-500">
                <FileWarning className="h-16 w-16 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                    Oops! Something went wrong
                </h3>
                <p className="text-center">{error.message}</p>
                <p className="text-sm mt-2">
                    Please try again or contact support if the problem persists.
                </p>
            </div>
        );
    }

    if (!data?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <FileWarning className="h-16 w-16 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Results Found</h3>
                <p className="text-center max-w-md">
                    Try adjusting your search terms or filters to find what
                    you're looking for.
                </p>
            </div>
        );
    }

    const visualizationData = transformDataForVisualization(data);
    const categories = Object.keys(visualizationData[0] || {}).filter(
        (key) => key !== "year"
    );

    return (
        <div className="space-y-4">
            {showVisualization && (
                <Card className="p-4 lg:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-lg font-medium">
                            Funding Trends by
                        </h3>
                        <select
                            value={groupBy}
                            onChange={(e) =>
                                setGroupBy(e.target.value as GroupByOption)
                            }
                            className="px-2 py-1.5 border rounded-md text-sm"
                        >
                            {groupByOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={visualizationData}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 50,
                                    bottom: 5,
                                }}
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
                                        const millions = value / 1000000;
                                        return `$${millions.toFixed(1)}M`;
                                    }}
                                    tickLine={false}
                                    axisLine={{ stroke: "#e5e7eb" }}
                                />
                                <Tooltip
                                    formatter={(
                                        value: number,
                                        name: string
                                    ) => [
                                        new Intl.NumberFormat("en-CA", {
                                            style: "currency",
                                            currency: "CAD",
                                            maximumFractionDigits: 0,
                                        }).format(value),
                                        name,
                                    ]}
                                    contentStyle={{
                                        backgroundColor: "white",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "6px",
                                        padding: "8px 12px",
                                    }}
                                />
                                <Legend />
                                {categories.map((category, index) => (
                                    <Line
                                        key={category}
                                        type="monotone"
                                        dataKey={category}
                                        name={category}
                                        stroke={
                                            typeof colors[category] === "string"
                                                ? colors[category]
                                                : colors.defaultColors[
                                                      index %
                                                          colors.defaultColors
                                                              .length
                                                  ]
                                        }
                                        strokeWidth={2}
                                        dot={{
                                            fill:
                                                typeof colors[category] ===
                                                "string"
                                                    ? colors[category]
                                                    : colors.defaultColors[
                                                          index %
                                                              colors
                                                                  .defaultColors
                                                                  .length
                                                      ],
                                            strokeWidth: 2,
                                        }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}

            {data.map((grant) => (
                <GrantCard
                    key={grant.ref_number}
                    grant={grant}
                    onBookmark={
                        onBookmark
                            ? () => onBookmark(grant.ref_number)
                            : undefined
                    }
                />
            ))}
        </div>
    );
};
