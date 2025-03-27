// src/pages/InstitutesPage.tsx
import { useState } from "react";
import { University, BookMarked, Users, DollarSign } from "lucide-react";
import {
    useInfiniteInstitutes,
    useSearchInstitutes,
} from "@/hooks/api/useInstitutes";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import { SortConfig } from "@/types/search";
import EntitiesPage from "@/components/common/pages/EntitiesPage";
import EntityCard from "@/components/common/ui/EntityCard";
import { Institute } from "@/types/models";

const InstitutesPage = () => {
    // State for search terms, filters, and sort
    const [searchTerms, setSearchTerms] = useState({ name: "" });
    const [isSearching, setIsSearching] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: "recipient_count",
        direction: "desc",
    });
    const [filters, setFilters] = useState(DEFAULT_FILTER_STATE);

    // Use infinite query for institutes - fixing parameter type
    const infiniteQuery = useInfiniteInstitutes(20); // Using a default pageSize of 20

    // Search query for when search is active
    const searchQuery = useSearchInstitutes(
        searchTerms.name,
        isSearching,
        1, // Page number (default to 1)
        20 // Page size (default to 20)
    );

    // Use search results or regular results based on search state
    const effectiveQuery = isSearching ? searchQuery : infiniteQuery;

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
    const keyExtractor = (institute: Institute) =>
        `institute-${institute.institute_id}`;

    // Handle sorting changes
    const handleSortChange = (newSortConfig: SortConfig) => {
        setSortConfig(newSortConfig);
    };

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
                infiniteQuery: effectiveQuery,
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
                onSortChange: handleSortChange,
            }}
        />
    );
};

export default InstitutesPage;
