// src/pages/SearchPage.tsx
import { useState } from "react";
import { FileSearch2, University, UserSearch } from "lucide-react";
import { useInfiniteGrantSearch } from "@/hooks/api/useGrants";
import GrantsList from "@/components/features/grants/GrantsList";
import type { GrantSortConfig as SortConfig } from "@/types/search";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import type { GrantSearchParams } from "@/types/search";
import SearchInterface from "@/components/features/search/SearchInterface";
import PageHeader from "@/components/common/layout/PageHeader";
import PageContainer from "@/components/common/layout/PageContainer";

export const SearchPage = () => {
    // Current search terms (what's shown in the input fields)
    const [searchTerms, setSearchTerms] = useState({
        recipient: "",
        institute: "",
        grant: "",
    });

    // UI state controls
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [sortConfig] = useState<SortConfig>({
        field: "date",
        direction: "desc",
    });
    const [filters, setFilters] = useState(DEFAULT_FILTER_STATE);
    const [isInitialState, setIsInitialState] = useState(true);

    // Create search params
    const searchParams: Omit<GrantSearchParams, "pagination"> = {
        searchTerms,
        filters,
        sortConfig,
    };

    // Initialize infinite query
    const infiniteQueryResult = useInfiniteGrantSearch(searchParams);

    const handleSearch = (params: {
        searchTerms: Record<string, string>;
        filters: typeof DEFAULT_FILTER_STATE;
    }) => {
        setSearchTerms(
            params.searchTerms as {
                recipient: string;
                institute: string;
                grant: string;
            }
        );
        setFilters(params.filters);
        setIsInitialState(false);

        // Refetch with updated parameters
        setTimeout(() => {
            infiniteQueryResult.refetch();
        }, 0);
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        // Implement the actual bookmark functionality here
    };

    return (
        <PageContainer>
            {/* Header */}
            <PageHeader title="Advanced Grant Search" />

            {/* Search Interface */}
            <SearchInterface
                fields={[
                    {
                        key: "recipient",
                        icon: UserSearch,
                        placeholder: "Search by recipient...",
                    },
                    {
                        key: "institute",
                        icon: University,
                        placeholder: "Search by institute...",
                    },
                    {
                        key: "grant",
                        icon: FileSearch2,
                        placeholder: "Search by grant...",
                    },
                ]}
                initialValues={searchTerms}
                filters={filters}
                onSearch={handleSearch}
                onBookmark={handleBookmark}
                isBookmarked={isBookmarked}
                isInitialState={isInitialState}
                showPopularSearches={true}
            />

            {/* Search Results */}
            <div className="mt-4">
                <GrantsList
                    infiniteQuery={infiniteQueryResult}
                    initialSortConfig={sortConfig}
                    emptyMessage={
                        isInitialState
                            ? "Enter search terms above to begin exploring grants."
                            : "No grants match your search criteria."
                    }
                    showVisualization={true}
                    visualizationInitiallyVisible={false}
                />
            </div>
        </PageContainer>
    );
};

export default SearchPage;
