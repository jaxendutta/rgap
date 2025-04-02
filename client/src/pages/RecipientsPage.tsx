// src/pages/RecipientsPage.tsx
import { useState, useEffect } from "react";
import { GraduationCap, BookMarked, Calendar, DollarSign } from "lucide-react";
import { useRecipients, useSearchRecipients } from "@/hooks/api/useData";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import { SortConfig } from "@/types/search";
import EntitiesPage from "@/components/common/pages/EntitiesPage";
import EntityCard from "@/components/common/ui/EntityCard";
import { Recipient } from "@/types/models";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UseInfiniteQueryResult } from "@tanstack/react-query";

const RecipientsPage = () => {
    const location = useLocation();
    const { user } = useAuth();

    // Extract search params from location state if they exist
    const stateSearchParams = location.state?.searchParams;

    // State for search terms, filters, and sort
    const [searchTerms, setSearchTerms] = useState({
        name: stateSearchParams?.searchTerms?.name || "",
    });
    const [isSearching, setIsSearching] = useState(
        !!stateSearchParams?.searchTerms?.name
    );
    const [sortConfig] = useState<SortConfig<Recipient>>(
        stateSearchParams?.sortConfig || {
            field: "total_funding",
            direction: "desc",
        }
    );
    const [filters, setFilters] = useState(
        stateSearchParams?.filters || DEFAULT_FILTER_STATE
    );

    // Use unified data hooks with bookmarking support
    const recipientsQuery = useRecipients({
        queryType: "infinite",
        sort: sortConfig,
        enabled: !isSearching,
        userId: user?.user_id,
    }) as UseInfiniteQueryResult<any, Error>;

    // Search query for when search is active
    const searchQuery = useSearchRecipients(searchTerms.name, {
        queryType: "infinite",
        sort: sortConfig,
        enabled: isSearching,
        userId: user?.user_id,
    }) as UseInfiniteQueryResult<any, Error>;

    // Use search results or regular results based on search state
    const effectiveQuery = isSearching ? searchQuery : recipientsQuery;

    // Effect to run search if we have search params in location state
    useEffect(() => {
        if (stateSearchParams?.searchTerms?.name) {
            setSearchTerms({ name: stateSearchParams.searchTerms.name });
            setIsSearching(true);
        }
    }, [stateSearchParams]);

    // Handle search
    const handleSearch = (params: {
        searchTerms: Record<string, string>;
        filters: typeof DEFAULT_FILTER_STATE;
    }) => {
        // Update search term state
        setSearchTerms({ name: params.searchTerms.name || "" });
        setFilters(params.filters);

        // Only set searching true if at least one search term has a value
        const hasSearchTerms =
            params.searchTerms.name && params.searchTerms.name.trim() !== "";
        setIsSearching(!!hasSearchTerms);
    };

    // Render function for recipient items
    const renderRecipientItem = (recipient: Recipient) => {
        return (
            <EntityCard
                entity={recipient}
                entityType="recipient"
                className="h-full"
            />
        );
    };

    // Key extractor for recipient items
    const keyExtractor = (recipient: Recipient) => recipient.recipient_id;

    return (
        <EntitiesPage
            headerConfig={{
                title: "Grant Recipients",
                subtitle:
                    "Explore organizations and individuals who have received research grants.",
            }}
            searchConfig={{
                variant: "simple",
                searchFieldKey: "name",
                placeholder: "Search by recipient name...",
                icon: GraduationCap,
                initialValues: searchTerms,
                filters: filters,
                onSearch: handleSearch,
                isInitialState: !isSearching,
            }}
            listConfig={{
                type: "entities",
                query: effectiveQuery,
                sortConfig: sortConfig,
                emptyMessage: isSearching
                    ? "No recipients match your search criteria."
                    : "No recipients found. Try adjusting your search.",
                entityType: "recipient",
                variant: "grid",
                renderItem: renderRecipientItem,
                keyExtractor: keyExtractor,
                sortOptions: [
                    { field: "grant_count", label: "Grants", icon: BookMarked },
                    {
                        field: "latest_grant_date",
                        label: "Latest Grant",
                        icon: Calendar,
                    },
                    {
                        field: "total_funding",
                        label: "Funding",
                        icon: DollarSign,
                    },
                ],
                viewContext: "custom",
            }}
        />
    );
};

export default RecipientsPage;
