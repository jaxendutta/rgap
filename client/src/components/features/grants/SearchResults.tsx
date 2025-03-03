// src/components/features/grants/SearchResults.tsx
import { useState } from "react";
import { ResearchGrant } from "@/types/models";
import { GrantCard } from "./GrantCard";
import { FileSearch, FileWarning } from "lucide-react";
import { TrendVisualizer } from "@/components/features/visualizations/TrendVisualizer";
import { LoadingSpinner } from "@/components/common/ui/LoadingSpinner";

type GroupByOption = "org" | "province" | "country" | "city";

interface SearchResultsProps {
    data?: ResearchGrant[];
    isLoading: boolean;
    error?: Error | null;
    onBookmark?: (grantId: string) => void;
    showVisualization?: boolean;
    isInitialState?: boolean;
}

const groupByOptions = [
    { value: "org", label: "Funding Agency" },
    { value: "province", label: "Province/State" },
    { value: "country", label: "Country" },
    { value: "city", label: "City" },
];

export const SearchResults = ({
    data,
    isLoading,
    error,
    onBookmark,
    showVisualization,
    isInitialState = true,
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

    if (isInitialState) {
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

    return (
        <div className="space-y-4">
            {showVisualization && (
                <TrendVisualizer
                    data={transformDataForVisualization(data)}
                    groupBy={groupBy}
                    onGroupByChange={(value) =>
                        setGroupBy(value as GroupByOption)
                    }
                    groupByOptions={groupByOptions}
                />
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
