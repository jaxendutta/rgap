// src/pages/SearchPage.tsx with proper type handling
import { useState, useEffect } from "react";
import { FileSearch2, University, UserSearch } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useGrantSearch } from "@/hooks/api/useData";
import { DEFAULT_SORT_CONFIG } from "@/types/search";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import type { GrantSearchParams, SortConfig } from "@/types/search";
import EntitiesPage from "@/components/common/pages/EntitiesPage";
import { Grant } from "@/types/models";

export const SearchPage = () => {
    const location = useLocation();

    // Extract search params from location state if they exist
    const stateSearchParams = location.state?.searchParams;

    // Current search terms (what's shown in the input fields)
    const [searchTerms, setSearchTerms] = useState({
        recipient: stateSearchParams?.searchTerms?.recipient || "",
        institute: stateSearchParams?.searchTerms?.institute || "",
        grant: stateSearchParams?.searchTerms?.grant || "",
    });

    // UI state controls
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [sortConfig] = useState<SortConfig<Grant>>(
        stateSearchParams?.sortConfig || DEFAULT_SORT_CONFIG<Grant>
    );

    // Initialize filters from state if available, otherwise use defaults
    const [filters, setFilters] = useState(
        stateSearchParams?.filters || DEFAULT_FILTER_STATE
    );

    // If we came from a search history card, we want to immediately search
    const [isInitialState, setIsInitialState] = useState(!stateSearchParams);

    // Effect to run search if we have search params in location state
    useEffect(() => {
        if (stateSearchParams) {
            // The search will be triggered because isInitialState is false
            console.log(
                "Running search from location state:",
                stateSearchParams
            );
        }
    }, [stateSearchParams]);

    // Create search params
    const searchParams: Omit<GrantSearchParams, "pagination"> = {
        searchTerms,
        filters,
        sortConfig,
    };

    // Use unified hook for grant search
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
                query: searchQuery,
                sortConfig: sortConfig,
                emptyMessage: isInitialState
                    ? "Enter search terms above to begin exploring grants."
                    : "No grants match your search criteria.",
                showVisualization: true,
                visualizationInitiallyVisible: false,
                viewContext: "search",
                keyExtractor: (grant: Grant) => grant.grant_id,
            }}
        />
    );
};

export default SearchPage;
