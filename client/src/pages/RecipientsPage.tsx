// src/pages/RecipientsPage.tsx
import { useState } from "react";
import { GraduationCap, BookMarked, Calendar, DollarSign } from "lucide-react";
import {
    useInfiniteRecipients,
    useSearchRecipients,
} from "@/hooks/api/useRecipients";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import { SortConfig } from "@/types/search";
import EntitiesPage from "@/components/common/pages/EntitiesPage";
import EntityCard from "@/components/common/ui/EntityCard";
import { Recipient } from "@/types/models";

const RecipientsPage = () => {
    // State for search terms, filters, and sort
    const [searchTerms, setSearchTerms] = useState({ name: "" });
    const [isSearching, setIsSearching] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: "total_funding",
        direction: "desc",
    });
    const [filters, setFilters] = useState(DEFAULT_FILTER_STATE);

    // Use infinite query for recipients
    const infiniteQuery = useInfiniteRecipients(20); // Using a default pageSize of 20

    // Search query for when search is active
    const searchQuery = useSearchRecipients(
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
    const keyExtractor = (recipient: Recipient) =>
        `recipient-${recipient.recipient_id}`;

    // Handle sorting changes
    const handleSortChange = (newSortConfig: SortConfig) => {
        setSortConfig(newSortConfig);
    };

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
                infiniteQuery: effectiveQuery,
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
                onSortChange: handleSortChange,
            }}
        />
    );
};

export default RecipientsPage;
