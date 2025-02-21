// src/components/features/grants/SearchResults.tsx
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

interface SearchResultsProps {
    data?: ResearchGrant[];
    isLoading: boolean;
    error?: Error | null;
    onBookmark?: (grantId: string) => void;
    showVisualization?: boolean;
    isEmptyState?: boolean;
}

export const SearchResults = ({
    data,
    isLoading,
    error,
    onBookmark,
    showVisualization,
    isEmptyState: isEmptyState = true,
}: SearchResultsProps) => {
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

    const transformDataForVisualization = (data: ResearchGrant[]) => {
        const yearMap = new Map();

        data.forEach((result) => {
            const year = new Date(result.agreement_start_date).getFullYear();
            const value = parseFloat(result.agreement_value.toString()) || 0; // Convert to number and handle NaN

            if (!yearMap.has(year)) {
                yearMap.set(year, {
                    year,
                    NSERC: 0,
                    SSHRC: 0,
                    CIHR: 0,
                });
            }

            const yearData = yearMap.get(year);
            if (result.org && typeof yearData[result.org] === "number") {
                yearData[result.org] += value;
            }
        });

        return Array.from(yearMap.values())
            .sort((a, b) => a.year - b.year)
            .map((entry) => ({
                ...entry,
                NSERC: Number(entry.NSERC.toFixed(2)) || 0, // Round to 2 decimal places and handle NaN
                SSHRC: Number(entry.SSHRC.toFixed(2)) || 0,
                CIHR: Number(entry.CIHR.toFixed(2)) || 0,
            }));
    };

    return (
        <div className="space-y-4">
            {showVisualization && (
                <Card className="p-4 lg:p-6">
                    <h3 className="text-lg font-medium mb-4">
                        Funding Trends by Agency
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={transformDataForVisualization(data)}
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
                                    formatter={(value: number) => [
                                        new Intl.NumberFormat("en-CA", {
                                            style: "currency",
                                            currency: "CAD",
                                            maximumFractionDigits: 0,
                                        }).format(value),
                                        "Funding",
                                    ]}
                                    contentStyle={{
                                        backgroundColor: "white",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "6px",
                                        padding: "8px 12px",
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="NSERC"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    dot={{ fill: "#2563eb", strokeWidth: 2 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="SSHRC"
                                    stroke="#7c3aed"
                                    strokeWidth={2}
                                    dot={{ fill: "#7c3aed", strokeWidth: 2 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="CIHR"
                                    stroke="#059669"
                                    strokeWidth={2}
                                    dot={{ fill: "#059669", strokeWidth: 2 }}
                                />
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
