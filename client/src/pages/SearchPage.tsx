// src/pages/SearchPage.tsx
import EntitiesPage from "@/components/common/pages/EntitiesPage";
import { useInfiniteGrantSearch } from "@/hooks/api/useGrants";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";

// Create a wrapper for useInfiniteGrantSearch to ensure proper parameters
const useInitialGrantSearch = (params: any) => {
    // When used as useInfiniteEntities, ensure we have default filters
    const searchParams = {
        searchTerms: {
            recipient: "",
            institute: "",
            grant: "",
        },
        filters: DEFAULT_FILTER_STATE,
        sortConfig: params || { field: "date", direction: "desc" },
    };

    return useInfiniteGrantSearch(searchParams);
};

// Create a wrapper for search queries
const useSearchGrantsWrapper = (params: any, enabled: boolean) => {
    // Make sure the search parameters are properly structured
    return useInfiniteGrantSearch(params, enabled);
};

const SearchPage = () => {
    return (
        <EntitiesPage
            entityType="grant"
            title="Advanced Grant Search"
            subtitle="Search for grants by recipient, institute, or grant details."
            useInfiniteEntities={useInitialGrantSearch}
            useSearchEntities={useSearchGrantsWrapper}
            variant="list"
            allowVisualization={true}
            emptyMessage="Enter search terms above to begin exploring grants."
            searchEmptyMessage="No grants match your search criteria."
            initialSortConfig={{ field: "date", direction: "desc" }}
        />
    );
};

export default SearchPage;
