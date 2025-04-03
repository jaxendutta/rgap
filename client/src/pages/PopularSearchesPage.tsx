// src/pages/PopularSearchesPage.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UseInfiniteQueryResult } from "@tanstack/react-query";
import {
    UserRoundSearch,
    University,
    FileSearch2,
    Search,
    BookMarked,
    ArrowRight,
} from "lucide-react";
import { Card } from "@/components/common/ui/Card";
import { DateRangeFilter } from "@/components/common/ui/DateRangeFilter";
import PageHeader from "@/components/common/layout/PageHeader";
import PageContainer from "@/components/common/layout/PageContainer";
import { Button } from "@/components/common/ui/Button";
import Tabs from "@/components/common/ui/Tabs";
import EntityList from "@/components/common/ui/EntityList";
import usePopularSearches, {
    SearchCategory,
} from "@/hooks/api/usePopularSearches";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import { SortConfig } from "@/types/search";
import { PopularSearch, Entity } from "@/types/models";
import EmptyState from "@/components/common/ui/EmptyState";

const PopularSearchesPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Get category from URL parameter, default to recipient
    const categoryParam = searchParams.get("category") as SearchCategory | null;

    // State for component
    const [activeCategory, setActiveCategory] = useState<SearchCategory>(
        categoryParam || "recipient"
    );
    const [dateRange, setDateRange] = useState({
        from: DEFAULT_FILTER_STATE.dateRange.from,
        to: DEFAULT_FILTER_STATE.dateRange.to,
    });
    const [sortConfig] = useState<SortConfig<PopularSearch>>({
        field: "count",
        direction: "desc",
    });

    // Update URL when category changes
    useEffect(() => {
        searchParams.set("category", activeCategory);
        setSearchParams(searchParams);
    }, [activeCategory, searchParams, setSearchParams]);

    // Define the tabs for the interface
    const tabs = [
        {
            id: "recipient",
            label: "Recipients",
            icon: UserRoundSearch,
        },
        {
            id: "institute",
            label: "Institutes",
            icon: University,
        },
        {
            id: "grant",
            label: "Grants",
            icon: FileSearch2,
        },
    ];

    // Fetch popular searches with pagination
    const { popularSearches, isLoading, error, refetch } =
        usePopularSearches({
            dateRange,
            enabled: true,
        });
    
    // Calculate total items from the search results
    const totalItems = Array.isArray(popularSearches) ? popularSearches.length : 0;

    // Sort items based on current sort config
    const sortedItems = useMemo(() => {
        const { field, direction } = sortConfig;
        return [...popularSearches].sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];

            if (typeof aVal === "number" && typeof bVal === "number") {
                return direction === "asc" ? aVal - bVal : bVal - aVal;
            }

            if (typeof aVal === "string" && typeof bVal === "string") {
                return direction === "asc"
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            return 0;
        });
    }, [popularSearches, sortConfig]);

    // Handle date range change
    const handleDateRangeChange = (newRange: { from: Date; to: Date }) => {
        setDateRange(newRange);
    };

    // Handle search term selection
    const handleSelectTerm = (category: SearchCategory, term: string) => {
        // Navigate to the search page with the selected term and set state to trigger immediate search
        const searchTerms: Record<string, string> = {
            recipient: category === "recipient" ? term : "",
            institute: category === "institute" ? term : "",
            grant: category === "grant" ? term : "",
        };

        // Navigate to the search page with search parameters in state
        navigate("/search", {
            state: {
                searchParams: {
                    searchTerms,
                    filters: DEFAULT_FILTER_STATE,
                },
            },
        });
    };

    // Render a search term item
    const renderSearchTermItem = (item: Entity["popular_search"]) => (
        <Card className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3 w-full truncate">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {(item.index !== undefined ? item.index : 0) + 1}
                </div>
                <div className="flex flex-col truncate">
                    <span className="font-medium truncate">{item.text}</span>
                    <span className="text-sm text-gray-500 truncate">
                        {item.count} searches
                    </span>
                </div>
            </div>

            <Button
                size="sm"
                variant="secondary"
                pill={true}
                leftIcon={Search}
                className="p-2 transition-colors hover:text-blue-600 hover:shadow-sm hover:border-blue-200"
                onClick={() => handleSelectTerm(item.category, item.text)}
            />
        </Card>
    );

    // Create a mock query result that matches the expected interface
    const mockQueryResult = useMemo(() => ({
        data: {
            pages: [
                {
                    totalItems,
                    items: sortedItems,
                },
            ],
            pageParams: [0],
        },
        isLoading,
        isError: !!error,
        error,
        refetch,
    } as UseInfiniteQueryResult<any, Error>), [totalItems, sortedItems, isLoading, error, refetch]);

    return (
        <PageContainer>
            <PageHeader
                title="Popular Searches"
                subtitle="Discover trending search terms across our database"
            />
            <div className="mb-4">
                <DateRangeFilter
                    label="Time Period"
                    value={dateRange}
                    onChange={handleDateRangeChange}
                />
            </div>

            <Card className="mb-8">
                {/* Category Tabs */}
                <Tabs
                    tabs={tabs}
                    activeTab={activeCategory}
                    onChange={(tabId) =>
                        setActiveCategory(tabId as SearchCategory)
                    }
                    variant="underline"
                    size="md"
                    fullWidth={true}
                />

                {/* Search Terms List using EntityList */}
                <EntityList<PopularSearch>
                    entityType={`popular_search`}
                    entities={sortedItems}
                    renderItem={(item) => renderSearchTermItem(item)}
                    variant="list"
                    query={mockQueryResult}
                    emptyState={
                        <EmptyState
                            title="No Popular Searches Found"
                            message="Try selecting a different date range or category."
                            icon={BookMarked}
                            primaryAction={{
                                label: "Go to Search",
                                icon: ArrowRight,
                                onClick: () => navigate("/search"),
                            }}
                        />
                    }
                    className="p-4"
                />
            </Card>
        </PageContainer>
    );
};

export default PopularSearchesPage;
