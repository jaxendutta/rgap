// src/components/common/pages/EntitiesPage.tsx
import React from "react";
import PageContainer from "@/components/common/layout/PageContainer";
import PageHeader from "@/components/common/layout/PageHeader";
import SearchInterface from "@/components/features/search/SearchInterface";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import { LucideIcon, Search } from "lucide-react";
import { SortConfig } from "@/types/search";
import EntityList from "@/components/common/ui/EntityList";
import GrantsList from "@/components/features/grants/GrantsList";
import { UseInfiniteQueryResult, UseQueryResult } from "@tanstack/react-query";
import { Button } from "@/components/common/ui/Button";

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

interface ListConfig {
    type: "grants" | "entities";
    query: UseInfiniteQueryResult<any, Error> | UseQueryResult<any, Error>;
    sortConfig: SortConfig;
    emptyMessage: string;
    showVisualization?: boolean;
    visualizationInitiallyVisible?: boolean;
    viewContext?: "search" | "recipient" | "institute" | "custom";
    variant?: "list" | "grid";
    entityType?: string;
    renderItem?: (item: any) => React.ReactNode;
    keyExtractor?: (item: any, index: number) => string;
    sortOptions?: Array<{
        field: string;
        label: string;
        icon: LucideIcon;
    }>;
    onSortChange?: (config: SortConfig) => void;
}

interface EntitiesPageProps {
    headerConfig: HeaderConfig;
    searchConfig?: SearchConfig;
    listConfig: ListConfig;
}

const EntitiesPage: React.FC<EntitiesPageProps> = ({
    headerConfig,
    searchConfig,
    listConfig,
}) => {
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

    // Determine if this is an infinite query
    const isInfiniteQuery = "fetchNextPage" in listConfig.query;

    // Get metadata safely
    const getMetadata = () => {
        if (!listConfig.query.data) {
            return { totalCount: 0 };
        }

        if (
            isInfiniteQuery &&
            "pages" in listConfig.query.data &&
            listConfig.query.data.pages.length > 0
        ) {
            return (
                listConfig.query.data.pages[0].metadata || {
                    totalCount: 0,
                }
            );
        }

        return listConfig.query.data.metadata || { totalCount: 0 };
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
            // Simple search interface with just a search bar and button
            const Icon = searchConfig.icon || Search;
            const searchFieldKey = searchConfig.searchFieldKey;

            return (
                <div className="flex gap-2">
                    <div className="relative shadow-sm flex-1">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="search"
                            placeholder={searchConfig.placeholder}
                            value={
                                searchConfig.initialValues[searchFieldKey] || ""
                            }
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                // Create a synthetic event to simulate the SearchInterface onChange
                                searchConfig.initialValues[searchFieldKey] =
                                    e.target.value;
                            }}
                            onKeyDown={(
                                e: React.KeyboardEvent<HTMLInputElement>
                            ) => {
                                if (e.key === "Enter") {
                                    searchConfig.onSearch({
                                        searchTerms: searchConfig.initialValues,
                                        filters: searchConfig.filters,
                                    });
                                }
                            }}
                            className="w-full pl-10 pr-2.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
                        />
                    </div>
                    <Button
                        variant="primary"
                        leftIcon={Search}
                        onClick={() => {
                            searchConfig.onSearch({
                                searchTerms: searchConfig.initialValues,
                                filters: searchConfig.filters,
                            });
                        }}
                        className="bg-gray-900 hover:bg-gray-800"
                    >
                        <span className="hidden lg:inline">Search</span>
                    </Button>
                </div>
            );
        }
    };

    // Render the appropriate list component based on the type
    const renderList = () => {
        if (listConfig.type === "grants") {
            return (
                <GrantsList
                    grants={getEntitiesFromQuery(listConfig.query)}
                    query={
                        listConfig.query as UseInfiniteQueryResult<
                            any,
                            Error
                        >
                    }
                    initialSortConfig={listConfig.sortConfig}
                    emptyMessage={listConfig.emptyMessage}
                    showVisualization={listConfig.showVisualization}
                    visualizationInitiallyVisible={
                        listConfig.visualizationInitiallyVisible
                    }
                    viewContext={listConfig.viewContext as any}
                />
            );
        } else {
            const entities = getEntitiesFromQuery(listConfig.query);
            const metadata = getMetadata();

            return (
                <EntityList
                    entityType={listConfig.entityType || "entity"}
                    entities={entities}
                    renderItem={
                        listConfig.renderItem ||
                        ((item) => <div>{JSON.stringify(item)}</div>)
                    }
                    keyExtractor={
                        listConfig.keyExtractor ||
                        ((_, index) => `entity-${index}`)
                    }
                    variant={listConfig.variant || "list"}
                    sortOptions={listConfig.sortOptions || []}
                    sortConfig={listConfig.sortConfig}
                    onSortChange={listConfig.onSortChange || (() => {})}
                    query={
                        isInfiniteQuery
                            ? (listConfig.query as UseInfiniteQueryResult<
                                  any,
                                  Error
                              >)
                            : undefined
                    }
                    isLoading={listConfig.query.isLoading}
                    isError={listConfig.query.isError}
                    error={listConfig.query.error}
                    emptyMessage={listConfig.emptyMessage}
                    totalCount={metadata.totalCount || entities.length}
                    totalItems={entities.length}
                />
            );
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
            {searchConfig && (
                <div className="mb-6">{renderSearchInterface()}</div>
            )}

            {/* Content */}
            <div className="mt-4">{renderList()}</div>
        </PageContainer>
    );
};

export default EntitiesPage;
