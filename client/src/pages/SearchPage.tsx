// src/pages/SearchPage.tsx
import { useState } from "react";
import { FileSearch2, University, UserSearch } from "lucide-react";
import { useGrantSearch } from "@/hooks/api/useData";
import type { GrantSortConfig as SortConfig } from "@/types/search";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import type { GrantSearchParams } from "@/types/search";
import EntitiesPage from "@/components/common/pages/EntitiesPage";

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

    // Use our new unified hook for grant search
    const searchQuery = useGrantSearch(searchParams, {
        queryType: "infinite",
        enabled: !isInitialState,
    });

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
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        // Implement the actual bookmark functionality here
    };

    return (
        <EntitiesPage
            headerConfig={{
                title: "Advanced Grant Search",
                subtitle:
                    "Search for grants across multiple funding agencies and recipients.",
            }}
            searchConfig={{
                variant: "full", // Using the full-featured search interface
                fields: [
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
                ],
                initialValues: searchTerms,
                filters: filters,
                onSearch: handleSearch,
                onBookmark: handleBookmark,
                isBookmarked: isBookmarked,
                isInitialState: isInitialState,
                showPopularSearches: true,
            }}
            listConfig={{
                type: "grants",
                infiniteQuery: searchQuery,
                sortConfig: sortConfig,
                emptyMessage: isInitialState
                    ? "Enter search terms above to begin exploring grants."
                    : "No grants match your search criteria.",
                showVisualization: true,
                visualizationInitiallyVisible: false,
                viewContext: "search",
            }}
        />
    );
};

export default SearchPage;
