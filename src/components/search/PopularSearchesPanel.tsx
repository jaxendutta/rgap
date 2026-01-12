'use client';

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    LuUser,
    LuUniversity,
    LuFileText,
    LuTrendingUp,
    LuChevronRight,
    LuLoader
} from "react-icons/lu";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import Tabs from "@/components/ui/Tabs";
import EmptyState from "@/components/ui/EmptyState";
import { SearchCategory, PopularSearch } from "@/types/search"; // <--- NEW IMPORT
import { getPopularSearches } from "@/app/actions/analytics";

interface PopularSearchesPanelProps {
    onSelect?: (category: SearchCategory, term: string) => void;
    className?: string;
}

export const PopularSearchesPanel = ({
    onSelect,
    className
}: PopularSearchesPanelProps) => {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState<SearchCategory>("recipient");
    const [data, setData] = useState<PopularSearch[]>([]);
    const [isPending, startTransition] = useTransition();

    // Fetch data when category changes
    useEffect(() => {
        startTransition(async () => {
            const results = await getPopularSearches(activeCategory, 5);
            setData(results);
        });
    }, [activeCategory]);

    // ... rest of the component (render logic remains the same)

    const handleSelect = (term: string) => {
        if (onSelect) {
            onSelect(activeCategory, term);
        } else {
            const params = new URLSearchParams();
            params.set(activeCategory, term);
            router.push(`/search?${params.toString()}`);
        }
    };

    const tabs = [
        { id: "recipient", label: "Recipients", icon: LuUser },
        { id: "institute", label: "Institutes", icon: LuUniversity },
        { id: "grant", label: "Grants", icon: LuFileText },
    ];

    return (
        <Card className={className}>
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                        <LuTrendingUp className="w-5 h-5 text-blue-600" />
                        <h3>Popular Searches</h3>
                    </div>
                </div>

                <Tabs
                    tabs={tabs}
                    activeTab={activeCategory}
                    onChange={(id) => setActiveCategory(id as SearchCategory)}
                    variant="underline"
                    size="sm"
                    fullWidth
                />

                <div className="min-h-[200px]">
                    {isPending ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
                            <LuLoader className="w-6 h-6 animate-spin" />
                            <span className="text-xs">Updating trends...</span>
                        </div>
                    ) : data.length > 0 ? (
                        <div className="space-y-1 mt-2">
                            {data.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelect(item.text)}
                                    className="w-full group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                                            {index + 1}
                                        </span>
                                        <span className="text-sm text-gray-700 font-medium truncate group-hover:text-blue-700 transition-colors">
                                            {item.text}
                                        </span>
                                    </div>

                                    <Tag
                                        variant="secondary"
                                        size="sm"
                                        className="text-[10px] px-1.5 h-5 text-gray-400 font-normal bg-transparent border border-gray-100"
                                        text={String(item.count)}
                                    />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center">
                            <EmptyState
                                title="No trends yet"
                                message="Start searching to see what's popular!"
                                size="sm"
                            />
                        </div>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-gray-500 hover:text-gray-900 mt-2"
                    onClick={() => router.push(`/search`)}
                >
                    View All Categories
                    <LuChevronRight className="w-3 h-3 ml-1" />
                </Button>
            </div>
        </Card>
    );
};
