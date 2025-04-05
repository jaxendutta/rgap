// src/pages/SearchPage.tsx
import { useState, useEffect, useCallback } from "react";
import { FileSearch2, University, UserSearch } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
    getDataFromResult,
    useAllGrantSearch,
    useGrantSearch,
} from "@/hooks/api/useData";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import {
    getSortOptions,
    type GrantSearchParams,
    type SortConfig,
} from "@/types/search";
import EntitiesPage from "@/components/common/pages/EntitiesPage";
import { Grant } from "@/types/models";
import { GrantCard } from "@/components/features/grants/GrantCard";
import { useAuth } from "@/contexts/AuthContext";
import { useToggleBookmark } from "@/hooks/api/useBookmarks";
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import createAPI from "@/utils/api";

// Create API instance
const API = createAPI();

export const SearchPage = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const toggleBookmarkMutation = useToggleBookmark("search");

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
        stateSearchParams?.sortConfig || {
            field: getSortOptions("grant")[0].field,
            direction: "desc",
        }
    );

    // Current search history entry ID for bookmarking
    const [currentSearchHistoryId, setCurrentSearchHistoryId] = useState<
        number | null
    >(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Initialize filters from state if available, otherwise use defaults
    const [filters, setFilters] = useState(
        stateSearchParams?.filters || DEFAULT_FILTER_STATE
    );

    // If we came from a search history card, we want to immediately search
    const [isInitialState, setIsInitialState] = useState(!stateSearchParams);

    // Create search params
    const searchParams: Omit<GrantSearchParams, "pagination"> = {
        searchTerms,
        filters,
        sortConfig,
    };

    // Use unified hook for grant search with paged results for UI
    const searchQuery = useGrantSearch(searchParams, {
        queryOptions: {
            onSuccess: (data: any) => {
                // The search query has completed successfully
                // Check if we have a valid result with grants
                if (data?.pages?.length > 0) {
                    setHasSearched(true);

                    // Check if we can find the search history ID from the response metadata
                    const historyId = data.pages[0]?.metadata?.historyId;
                    if (historyId) {
                        setCurrentSearchHistoryId(historyId);
                    }

                    // Also check if this search is already bookmarked
                    const isAlreadyBookmarked =
                        data.pages[0]?.metadata?.bookmarked;
                    if (isAlreadyBookmarked !== undefined) {
                        setIsBookmarked(isAlreadyBookmarked);
                    }

                    // If we don't have the history ID but the search is complete,
                    // we need to fetch the latest search history entry
                    if (!historyId && user?.user_id && !isInitialState) {
                        fetchLatestSearchId();
                    }
                }
            },
        },
    });

    // For visualization, we need ALL grant results (use complete query type)
    const allGrantsQuery = useAllGrantSearch(searchParams, {
        logSearchHistory: false,
    });
    const allGrants = getDataFromResult(allGrantsQuery);

    // Function to fetch the latest search history ID for the current user
    const fetchLatestSearchId = useCallback(async () => {
        if (!user?.user_id) return;

        try {
            // Get the most recent search history entry
            const response = await API.get(`/search-history/${user.user_id}`, {
                params: {
                    limit: 1,
                    sortField: "search_time",
                    sortDirection: "desc",
                },
            });

            // Check if we got a valid response with data
            if (response.data?.data?.length > 0) {
                const latestSearch = response.data.data[0];
                setCurrentSearchHistoryId(latestSearch.history_id);
                setIsBookmarked(!!latestSearch.bookmarked);
            }
        } catch (error) {
            console.error("Error fetching latest search history:", error);
        }
    }, [user?.user_id]);

    // Effect to run search if we have search params in location state
    useEffect(() => {
        if (stateSearchParams) {
            // The search will be triggered because isInitialState is false
            console.log(
                "Running search from location state:",
                stateSearchParams
            );

            // Mark as having searched
            setHasSearched(true);
        }
    }, [stateSearchParams]);

    // Handle search terms or filters
    const handleSearch = (params: {
        searchTerms: Record<string, string>;
        filters: typeof DEFAULT_FILTER_STATE;
    }) => {
        // Check if any search terms have values
        const hasAnyTerms = Object.values(params.searchTerms).some(
            (term) => term && term.trim() !== ""
        );

        // Only set the search state if there are actual search terms
        if (hasAnyTerms) {
            setSearchTerms(
                params.searchTerms as {
                    recipient: string;
                    institute: string;
                    grant: string;
                }
            );
            setFilters(params.filters);
            setIsInitialState(false);
            // Set hasSearched to true when a search is performed
            setHasSearched(true);

            // Reset bookmark status when starting a new search
            setIsBookmarked(false);
            setCurrentSearchHistoryId(null);
        } else {
            // If there are no search terms, let the user know
            showNotification("Please enter at least one search term", "info");
        }
    };

    // Handle bookmarking the current search
    const handleBookmark = () => {
        // Make sure user is logged in
        if (!user) {
            showNotification(
                "You must be logged in to bookmark searches",
                "error"
            );
            return;
        }

        // Make sure we have a valid search to bookmark (we've searched and have results)
        if (!hasSearched || isInitialState) {
            showNotification(
                "You need to perform a search before bookmarking",
                "info"
            );
            return;
        }

        // If we don't have a search history ID but a search was performed, try to fetch it
        if (!currentSearchHistoryId && user?.user_id) {
            fetchLatestSearchId().then(() => {
                if (currentSearchHistoryId) {
                    // If we now have the ID, proceed with toggling the bookmark
                    toggleBookmark();
                } else {
                    showNotification(
                        "Unable to find the search to bookmark. Please try searching again.",
                        "error"
                    );
                }
            });
            return;
        }

        // Toggle the bookmark if we have the search history ID
        if (currentSearchHistoryId) {
            toggleBookmark();
        } else {
            showNotification(
                "Unable to find the search to bookmark. Please try searching again.",
                "error"
            );
        }
    };

    // Helper function to toggle the bookmark
    const toggleBookmark = () => {
        if (!user || !currentSearchHistoryId) return;

        // Optimistically update the UI state
        setIsBookmarked(!isBookmarked);

        // Call the mutation with the CURRENT state (before toggling)
        toggleBookmarkMutation.mutate(
            {
                user_id: user.user_id,
                entity_id: currentSearchHistoryId,
                isBookmarked: isBookmarked, // The current state before toggling
            },
            {
                onError: (error) => {
                    // Revert UI state on error
                    setIsBookmarked(isBookmarked);
                    console.error("Bookmark toggle error: ", error);
                    showNotification(
                        `Failed to ${
                            isBookmarked ? "remove" : "add"
                        } bookmark. Please try again.`,
                        "error"
                    );
                },
            }
        );
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
                entityType: "grant",
                query: searchQuery,
                renderItem: (grant) => <GrantCard grant={grant as Grant} />,
                emptyMessage: isInitialState
                    ? "Enter search terms above to begin exploring grants."
                    : "No grants match your search criteria.",
                showVisualization: true,
                visualizationData: allGrants,
                viewContext: "search",
            }}
        />
    );
};

export default SearchPage;
