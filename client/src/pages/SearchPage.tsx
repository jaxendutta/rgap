// src/pages/SearchPage.tsx
import { useState, useEffect} from "react";
import { FileSearch2, University, UserSearch } from "lucide-react";
import { useInfiniteGrantSearch } from "@/hooks/api/useGrants";
import { useLocation } from "react-router-dom";
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

    // React Router: read the location for "params" query
    const location = useLocation();

    // Handle rerun logic: if `params` query param exists, parse & apply
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const serializedParams = urlParams.get("params");
        if (serializedParams) {
        try {
            const parsed: GrantSearchParams = JSON.parse(decodeURIComponent(serializedParams));

            // Only apply the fields that exist in our data model
            if (parsed.searchTerms) {
            setSearchTerms({
                recipient: parsed.searchTerms.recipient || "",
                institute: parsed.searchTerms.institute || "",
                grant: parsed.searchTerms.grant || "",
            });
            }
            if (parsed.filters) {
            setFilters((prev) => ({ ...prev, ...parsed.filters }));
            }

            // Once we have data, we can assume it's not initial state
            setIsInitialState(false);

            // Refetch with updated parameters
            setTimeout(() => {
            infiniteQueryResult.refetch();
            }, 0);
        } catch (err) {
            console.error("Failed to parse search params from URL:", err);
        }
        }
    }, [location.search]);

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

    const handleBookmarkGrant = (grantId: string) => {
        console.log("Bookmarking grant:", grantId);
        // Implement grant bookmarking here
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
                    title="Grants"
                    initialSortConfig={sortConfig}
                    onBookmark={handleBookmarkGrant}
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
