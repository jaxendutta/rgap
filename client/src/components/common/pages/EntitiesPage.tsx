// src/components/common/pages/EntitiesPage.tsx
import React from "react";
import PageContainer from "@/components/common/layout/PageContainer";
import PageHeader from "@/components/common/layout/PageHeader";
import SearchInterface from "@/components/features/search/SearchInterface";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import { Calendar, DollarSign, LucideIcon, Search } from "lucide-react";
import { SortConfig } from "@/types/search";
import EntityList from "@/components/common/ui/EntityList";
import { UseInfiniteQueryResult, UseQueryResult } from "@tanstack/react-query";
import { Button } from "@/components/common/ui/Button";
import { Grant } from "@/types/models";
import { GrantCard } from "@/components/features/grants/GrantCard";

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

interface ListConfig<T> {
    type: "grants" | "entities";
    entityId?: number;
    query: UseInfiniteQueryResult<any, Error>;
    sortConfig: SortConfig<T>;
    emptyMessage: string;
    showVisualization?: boolean;
    visualizationData?: Grant[];
    visualizationInitiallyVisible?: boolean;
    viewContext: "search" | "recipient" | "institute" | "custom";
    variant?: "list" | "grid";
    entityType?: string;
    renderItem?: (item: any) => React.ReactNode;
    keyExtractor: (item: any, index: number) => number;
    sortOptions?: Array<{
        field: string;
        label: string;
        icon: LucideIcon;
    }>;
    onSortChange?: (config: SortConfig<T>) => void;
}

interface EntitiesPageProps<T> {
    headerConfig: HeaderConfig;
    searchConfig?: SearchConfig;
    listConfig: ListConfig<T>;
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
            const [isVisualizationVisible, setIsVisualizationVisible] =
                React.useState<boolean>(
                    listConfig.visualizationInitiallyVisible || false
                );
            return (
                <EntityList
                    entityType="grant"
                    entities={getEntitiesFromQuery(listConfig.query)}
                    renderItem={(grant: Grant) => <GrantCard grant={grant} />}
                    keyExtractor={(grant: Grant) => grant.grant_id}
                    emptyMessage={
                        "This recipient has no associated grants in our database."
                    }
                    sortOptions={[
                        {
                            field: "agreement_start_date",
                            label: "Date",
                            icon: Calendar,
                        },
                        {
                            field: "agreement_value",
                            label: "Value",
                            icon: DollarSign,
                        },
                    ]}
                    initialSortConfig={
                        listConfig.sortConfig as SortConfig<Grant>
                    }
                    query={listConfig.query}
                    visualizationToggle={{
                        isVisible: isVisualizationVisible,
                        toggle: () =>
                            setIsVisualizationVisible(!isVisualizationVisible),
                        showToggleButton: true,
                    }}
                    viewContext={listConfig.viewContext}
                    entityId={listConfig.entityId}
                    showVisualization={true}
                    visualizationData={listConfig.visualizationData}
                />
            );
        } else {
            const entities = getEntitiesFromQuery(listConfig.query);
            return (
                <EntityList
                    entityType={listConfig.entityType || "entity"}
                    entities={entities}
                    renderItem={
                        listConfig.renderItem ||
                        ((item) => <div>{JSON.stringify(item)}</div>)
                    }
                    keyExtractor={listConfig.keyExtractor}
                    variant={listConfig.variant || "list"}
                    sortOptions={
                        listConfig.sortOptions?.map((option) => ({
                            ...option,
                            field: option.field as keyof T,
                        })) || []
                    }
                    initialSortConfig={listConfig.sortConfig}
                    query={listConfig.query}
                    viewContext={listConfig.viewContext}
                    isLoading={listConfig.query.isLoading}
                    isError={listConfig.query.isError}
                    error={listConfig.query.error}
                    emptyMessage={listConfig.emptyMessage}
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
