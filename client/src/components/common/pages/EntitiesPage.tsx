// src/components/common/pages/EntitiesPage.tsx
import { useState } from "react";
import PageContainer from "@/components/common/layout/PageContainer";
import PageHeader from "@/components/common/layout/PageHeader";
import SearchInterface from "@/components/features/search/SearchInterface";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import { LucideIcon, Search } from "lucide-react";
import EntityList, { EntityListProps } from "@/components/common/ui/EntityList";
import { UseInfiniteQueryResult, UseQueryResult } from "@tanstack/react-query";
import { Button } from "@/components/common/ui/Button";
import { Grant, Entity } from "@/types/models";
import { GrantCard } from "@/components/features/grants/GrantCard";
import { SearchField } from "@/components/features/search/SearchField";

interface HeaderConfig {
    title: string;
    subtitle?: string;
}

interface BaseSearchConfig {
    initialValues: Record<string, string>;
    filters: typeof DEFAULT_FILTER_STATE;
    onSearch: (params: any) => void;
    isInitialState: boolean;
}

interface FullSearchConfig extends BaseSearchConfig {
    variant: "full";
    fields: Array<{
        key: string;
        icon: LucideIcon;
        placeholder: string;
    }>;
    onBookmark?: () => void;
    isBookmarked?: boolean;
    showPopularSearches?: boolean;
}

interface SimpleSearchConfig extends BaseSearchConfig {
    variant: "simple";
    placeholder: string;
    icon?: LucideIcon;
    searchFieldKey: string;
}

type SearchConfig = FullSearchConfig | SimpleSearchConfig;

interface EntitiesPageProps<T> {
    headerConfig: HeaderConfig;
    searchConfig?: SearchConfig;
    listConfig: EntityListProps<T>;
}

const EntitiesPage = <T,>({
    headerConfig,
    searchConfig,
    listConfig,
}: EntitiesPageProps<T>) => {
    // Helper function to get entities from query result
    const getEntitiesFromQuery = (
        query: UseInfiniteQueryResult<any, Error> | UseQueryResult<any, Error>
    ) => {
        // First check if query.data exists
        if (!query.data) {
            return [];
        }

        // Check if this is an infinite query (has pages property)
        if ("pages" in query.data && Array.isArray(query.data.pages)) {
            return query.data.pages.flatMap((page: any) => page.data || []);
        }

        // Otherwise, it's a regular query
        return query.data?.data || [];
    };

    // Render the appropriate search interface
    const renderSearchInterface = () => {
        if (!searchConfig) return null;

        if (searchConfig.variant === "full") {
            // Full-featured search interface with filters
            return (
                <SearchInterface
                    fields={searchConfig.fields}
                    initialValues={searchConfig.initialValues}
                    filters={searchConfig.filters}
                    onSearch={searchConfig.onSearch}
                    onBookmark={searchConfig.onBookmark}
                    isBookmarked={searchConfig.isBookmarked}
                    isInitialState={searchConfig.isInitialState}
                    showPopularSearches={searchConfig.showPopularSearches}
                />
            );
        } else {
            // Simple search interface using the SearchField component
            const Icon = searchConfig.icon || Search;
            const searchFieldKey = searchConfig.searchFieldKey;

            // We need to manage the current value to properly handle searches
            const [currentValue, setCurrentValue] = useState(
                searchConfig.initialValues[searchFieldKey] || ""
            );

            const handleSearch = () => {
                // Create an updated searchTerms object
                const updatedSearchTerms = {
                    ...searchConfig.initialValues,
                    [searchFieldKey]: currentValue,
                };

                searchConfig.onSearch({
                    searchTerms: updatedSearchTerms,
                    filters: searchConfig.filters,
                });
            };

            return (
                <div className="flex gap-2">
                    <div className="flex-1">
                        <SearchField
                            icon={Icon}
                            placeholder={searchConfig.placeholder}
                            value={currentValue}
                            onChange={setCurrentValue}
                            onEnter={handleSearch}
                        />
                    </div>
                    <Button
                        variant="primary"
                        leftIcon={Search}
                        onClick={handleSearch}
                        className="bg-gray-900 hover:bg-gray-800"
                        responsiveText={"hideOnMobile"}
                    >
                        Search
                    </Button>
                </div>
            );
        }
    };

    // Render the appropriate list component based on the type
    const renderList = () => {
        if (listConfig.entityType === ("grants" as keyof Entity)) {
            return (
                <EntityList
                    entityType="grant"
                    entities={getEntitiesFromQuery(listConfig.query)}
                    renderItem={(grant: Grant) => <GrantCard grant={grant} />}
                    emptyMessage={
                        "This recipient has no associated grants in our database."
                    }
                    query={listConfig.query}
                    viewContext={listConfig.viewContext}
                    entityId={listConfig.entityId}
                    showVisualization={true}
                    visualizationData={listConfig.visualizationData}
                />
            );
        } else {
            const entities = getEntitiesFromQuery(listConfig.query);
            return <EntityList {...listConfig} entities={entities} />;
        }
    };

    return (
        <PageContainer>
            {/* Header section */}
            <PageHeader
                title={headerConfig.title}
                subtitle={headerConfig.subtitle}
            />

            {/* Search interface */}
            {searchConfig && renderSearchInterface()}

            {/* Content */}
            {renderList()}
        </PageContainer>
    );
};

export default EntitiesPage;
