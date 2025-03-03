// src/components/features/search/PopularSearchesPanel.tsx
import { useState } from "react";
import { cn } from "@/utils/cn";
import { Card } from "@/components/common/ui/Card";
import { UserRoundSearch, University, FileSearch2 } from "lucide-react";

export type SearchCategory = "recipient" | "institute" | "grant";

interface PopularSearchTerm {
    text: string;
    count: number;
}

interface PopularSearchesPanelProps {
    onSelect: (category: SearchCategory, term: string) => void;
}

// Mock data for popular searches
const POPULAR_SEARCHES: Record<SearchCategory, PopularSearchTerm[]> = {
    recipient: [
        { text: "John Smith", count: 245 },
        { text: "University of Toronto", count: 187 },
        { text: "McGill University", count: 156 },
        { text: "University of British Columbia", count: 143 },
        { text: "University of Alberta", count: 129 },
    ],
    institute: [
        { text: "University of Toronto", count: 312 },
        { text: "McGill University", count: 287 },
        { text: "University of British Columbia", count: 254 },
        { text: "University of Waterloo", count: 198 },
        { text: "University of Alberta", count: 176 },
    ],
    grant: [
        { text: "COVID-19 Research", count: 145 },
        { text: "Cancer Research", count: 132 },
        { text: "Climate Change", count: 118 },
        { text: "Artificial Intelligence", count: 98 },
        { text: "Renewable Energy", count: 87 },
    ],
};

export const PopularSearchesPanel = ({
    onSelect,
}: PopularSearchesPanelProps) => {
    const [activeCategory, setActiveCategory] =
        useState<SearchCategory>("recipient");

    return (
        <Card className="p-4">
            <h3 className="text-md font-medium mb-4">Popular Searches</h3>

            {/* Category Tabs */}
            <div className="flex border-b mb-4">
                <button
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center",
                        activeCategory === "recipient"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                    onClick={() => setActiveCategory("recipient")}
                >
                    <UserRoundSearch className="h-4 w-4 mr-2" />
                    Recipients
                </button>

                <button
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center",
                        activeCategory === "institute"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                    onClick={() => setActiveCategory("institute")}
                >
                    <University className="h-4 w-4 mr-2" />
                    Institutes
                </button>

                <button
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center",
                        activeCategory === "grant"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                    onClick={() => setActiveCategory("grant")}
                >
                    <FileSearch2 className="h-4 w-4 mr-2" />
                    Grants
                </button>
            </div>

            {/* Search Terms List */}
            <div className="space-y-2">
                {POPULAR_SEARCHES[activeCategory].map((term, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(activeCategory, term.text)}
                        className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md transition-colors text-left"
                    >
                        <span className="text-gray-800">{term.text}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {term.count} searches
                        </span>
                    </button>
                ))}
            </div>
        </Card>
    );
};
