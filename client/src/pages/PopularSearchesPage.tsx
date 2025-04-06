// src/pages/PopularSearchesPage.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    UserRoundSearch,
    University,
    FileSearch2,
    Search,
    BookMarked,
    ArrowRight,
} from "lucide-react";
import PageContainer from "@/components/common/layout/PageContainer";
import PageHeader from "@/components/common/layout/PageHeader";
import { Card } from "@/components/common/ui/Card";
import { DateRangeFilter } from "@/components/common/ui/DateRangeFilter";
import EmptyState from "@/components/common/ui/EmptyState";
import Tabs from "@/components/common/ui/Tabs";
import EntityList from "@/components/common/ui/EntityList";
import { Button } from "@/components/common/ui/Button";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import { PopularSearch, SearchCategory } from "@/types/search";
import { getDataFromResult } from "@/hooks/api/useData";
import { usePopularSearches } from "@/hooks/api/usePopularSearches";

// Extract PopularSearchCard to separate component to fix hook ordering issues
const PopularSearchCard = ({
    item,
    navigate,
}: {
    item: PopularSearch;
    navigate: ReturnType<typeof useNavigate>;
}) => {
    // Handle search term selection
    const handleSelectTerm = (category: SearchCategory, term: string) => {
        // Create search terms for navigation
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

    return (
        <Card className="p-3 hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {(item.index !== undefined && item.index < 1000
                            ? item.index
                            : 0) + 1}
                    </div>
                    <div className="flex flex-col truncate">
                        <span className="font-medium">{item.text}</span>
                        <span className="text-sm text-gray-500">
                            {item.count} searches
                        </span>
                    </div>
                </div>

                <Button
                    size="sm"
                    variant="outline"
                    leftIcon={Search}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() =>
                        handleSelectTerm(
                            item.category as SearchCategory,
                            item.text
                        )
                    }
                    responsiveText={"firstWord"}
                >
                    Search
                </Button>
            </div>
        </Card>
    );
};

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

    // Update URL when category changes
    useEffect(() => {
        searchParams.set("category", activeCategory);
        setSearchParams(searchParams);
    }, [activeCategory, searchParams, setSearchParams]);

    // Define the tabs configuration
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

    // Fetch popular searches with infinite pagination
    const popularSearchesQuery = usePopularSearches({
        dateRange,
        category: activeCategory,
        limit: 20,
        enabled: true,
    });

    // Extract data from query using the same helpers as other entity lists
    const searchTerms = useMemo(() => {
        return getDataFromResult(popularSearchesQuery);
    }, [popularSearchesQuery.data]);

    // Date range change handler
    const handleDateRangeChange = (newRange: { from: Date; to: Date }) => {
        setDateRange(newRange);
    };

    // Create a render function that properly passes navigate to the component
    const renderPopularSearchCard = (item: PopularSearch) => {
        return <PopularSearchCard item={item} navigate={navigate} />;
    };

    return (
        <PageContainer>
            <PageHeader
                title="Popular Searches"
                subtitle="Discover trending search terms across our database"
            />

            <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-4 w-full mb-6">
                <Tabs
                    tabs={tabs}
                    activeTab={activeCategory}
                    onChange={(tabId) =>
                        setActiveCategory(tabId as SearchCategory)
                    }
                    variant="pills"
                    fullWidth={true}
                    className="w-full lg:w-auto"
                />

                <DateRangeFilter
                    label="Time Period"
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    className="w-full lg:w-auto"
                />
            </div>

            <EntityList
                entityType="popular_search"
                entities={searchTerms}
                renderItem={renderPopularSearchCard}
                variant="grid"
                query={popularSearchesQuery}
                emptyState={
                    <EmptyState
                        title="No Popular Searches Found"
                        message="Try selecting a different date range or category."
                        icon={BookMarked}
                        variant={"card"}
                        primaryAction={{
                            label: "Go to Search",
                            icon: ArrowRight,
                            onClick: () => navigate("/search"),
                        }}
                    />
                }
            />
        </PageContainer>
    );
};

export default PopularSearchesPage;
