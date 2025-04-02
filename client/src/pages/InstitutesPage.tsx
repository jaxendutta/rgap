// src/pages/InstitutesPage.tsx
import { useState, useEffect } from "react";
import { University, BookMarked, Users, DollarSign } from "lucide-react";
import { useInstitutes, useSearchInstitutes } from "@/hooks/api/useData";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import { SortConfig } from "@/types/search";
import EntitiesPage from "@/components/common/pages/EntitiesPage";
import EntityCard from "@/components/common/ui/EntityCard";
import { Institute } from "@/types/models";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UseInfiniteQueryResult } from "@tanstack/react-query";

const InstitutesPage = () => {
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
    const [sortConfig] = useState<SortConfig<Institute>>(
        stateSearchParams?.sortConfig || {
            field: "recipient_count",
            direction: "desc",
        }
    );
    const [filters, setFilters] = useState(
        stateSearchParams?.filters || DEFAULT_FILTER_STATE
    );

    // Use unified data hooks with bookmarking support
    const institutesQuery = useInstitutes({
        queryType: "infinite",
        sort: sortConfig,
        enabled: !isSearching,
        userId: user?.user_id,
    });

    // Search query for when search is active
    const searchQuery = useSearchInstitutes(searchTerms.name, {
        queryType: "infinite",
        sort: sortConfig,
        enabled: isSearching,
        userId: user?.user_id,
    });

    // Use search results or regular results based on search state
    const effectiveQuery = (isSearching ? searchQuery : institutesQuery) as UseInfiniteQueryResult<any, Error>;

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

    // Render function for institute items
    const renderInstituteItem = (institute: Institute) => {
        return (
            <EntityCard
                entity={institute}
                entityType="institute"
                className="h-full"
            />
        );
    };

    // Key extractor for institute items
    const keyExtractor = (institute: Institute) => institute.institute_id;

    return (
        <EntitiesPage
            headerConfig={{
                title: "Research Institutes",
                subtitle: "Explore and discover research institutes.",
            }}
            searchConfig={{
                variant: "simple", // Using the simple search interface
                searchFieldKey: "name",
                placeholder: "Search by institute name...",
                icon: University,
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
                    ? "No institutes match your search criteria."
                    : "No institutes found. Try adjusting your search.",
                entityType: "institute",
                variant: "grid",
                renderItem: renderInstituteItem,
                keyExtractor: keyExtractor,
                sortOptions: [
                    {
                        field: "recipient_count",
                        label: "Recipients",
                        icon: Users,
                    },
                    { field: "grant_count", label: "Grants", icon: BookMarked },
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

export default InstitutesPage;
