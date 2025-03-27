// src/components/common/pages/EntitiesPage.tsx
import { useState, useMemo, useEffect } from "react";
import {
    Search,
    FileSearch2,
    UserSearch,
    University,
    BookMarked,
    Calendar,
    DollarSign,
    Users,
    Building,
    GraduationCap,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import PageContainer from "@/components/common/layout/PageContainer";
import PageHeader from "@/components/common/layout/PageHeader";
import SearchInterface from "@/components/features/search/SearchInterface";
import EntityList, { LayoutVariant } from "@/components/common/ui/EntityList";
import {
    Institute,
    Recipient,
    Grant,
    Entity,
    SearchHistory,
} from "@/types/models";
import { SortConfig } from "@/types/search";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import EntityCard from "@/components/common/ui/EntityCard";
import { GrantCard } from "@/components/features/grants/GrantCard";
import { SearchHistoryCard } from "@/components/features/account/SearchHistoryCard";
import { TrendVisualizer } from "@/components/features/visualizations/TrendVisualizer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/common/ui/Button";

interface EntityConfig {
    searchFields: Array<{
        key: string;
        icon: any;
        placeholder: string;
    }>;
    sortOptions: Array<{
        field: string;
        label: string;
        icon: any;
    }>;
    defaultSortConfig: {
        field:
            | "date"
            | "value"
            | "results"
            | "grant_count"
            | "total_funding"
            | "avg_funding"
            | "recipient_count";
        direction: "asc" | "desc";
    };
    searchPlaceholder: string;
    defaultEmptyMessage: string;
    defaultSearchEmptyMessage: string;
    defaultVariant: LayoutVariant;
}

interface EntitiesPageProps {
    // Basic page info
    entityType: Entity;
    title: string;
    subtitle?: string;

    // Query hooks
    useInfiniteEntities: any; // The infinite query hook
    useSearchEntities?: any; // The search query hook

    // UI Configuration
    variant?: "list" | "grid";
    emptyMessage?: string;
    searchEmptyMessage?: string;

    // Sort options
    initialSortConfig?: SortConfig;

    // Additional configuration
    allowVisualization?: boolean;
    customRenderItem?: (item: any, index: number) => React.ReactNode;
    customKeyExtractor?: (item: any, index: number) => string;
    onRerunSearch?: (params: any) => void;
}

const EntitiesPage = ({
    entityType,
    title,
    subtitle,
    useInfiniteEntities,
    useSearchEntities,
    variant,
    emptyMessage,
    searchEmptyMessage,
    initialSortConfig,
    allowVisualization = true,
    customRenderItem,
    customKeyExtractor,
    onRerunSearch,
}: EntitiesPageProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Define entity-specific configs based on entityType
    const entityConfig: EntityConfig = useMemo(() => {
        switch (entityType) {
            case "grant":
                return {
                    searchFields: [
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
                    sortOptions: [
                        { field: "date", label: "Date", icon: Calendar },
                        { field: "value", label: "Value", icon: DollarSign },
                    ],
                    defaultSortConfig: { field: "date", direction: "desc" },
                    searchPlaceholder:
                        "Search by grant title, recipient, or institute...",
                    defaultEmptyMessage:
                        "No grants found. Try adjusting your search.",
                    defaultSearchEmptyMessage:
                        "No grants match your search criteria.",
                    defaultVariant: "list",
                };
            case "recipient":
                return {
                    searchFields: [
                        {
                            key: "name",
                            icon: GraduationCap,
                            placeholder: "Search by recipient name...",
                        },
                    ],
                    sortOptions: [
                        {
                            field: "grant_count",
                            label: "Grants",
                            icon: BookMarked,
                        },
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
                    defaultSortConfig: {
                        field: "grant_count",
                        direction: "desc",
                    },
                    searchPlaceholder: "Search by recipient name...",
                    defaultEmptyMessage:
                        "No recipients found. Try adjusting your search.",
                    defaultSearchEmptyMessage:
                        "No recipients match your search criteria.",
                    defaultVariant: "grid",
                };
            case "institute":
                return {
                    searchFields: [
                        {
                            key: "name",
                            icon: Building,
                            placeholder: "Search by institute name...",
                        },
                    ],
                    sortOptions: [
                        {
                            field: "recipient_count",
                            label: "Recipients",
                            icon: Users,
                        },
                        {
                            field: "grant_count",
                            label: "Grants",
                            icon: BookMarked,
                        },
                        {
                            field: "total_funding",
                            label: "Funding",
                            icon: DollarSign,
                        },
                    ],
                    defaultSortConfig: {
                        field: "recipient_count",
                        direction: "desc",
                    },
                    searchPlaceholder: "Search by institute name...",
                    defaultEmptyMessage:
                        "No institutes found. Try adjusting your search.",
                    defaultSearchEmptyMessage:
                        "No institutes match your search criteria.",
                    defaultVariant: "grid",
                };
            case "search":
                return {
                    searchFields: [], // No search for search history
                    sortOptions: [
                        { field: "date", label: "Date", icon: Calendar },
                        {
                            field: "results",
                            label: "Results",
                            icon: Search,
                        },
                    ],
                    defaultSortConfig: {
                        field: "date",
                        direction: "desc",
                    },
                    searchPlaceholder: "Search history...",
                    defaultEmptyMessage: "No search history found.",
                    defaultSearchEmptyMessage:
                        "No matching search history found.",
                    defaultVariant: "list",
                };
            default:
                return {
                    searchFields: [],
                    sortOptions: [],
                    defaultSortConfig: { field: "date", direction: "desc" },
                    searchPlaceholder: "Search...",
                    defaultEmptyMessage: "No items found.",
                    defaultSearchEmptyMessage:
                        "No items match your search criteria.",
                    defaultVariant: "list",
                };
        }
    }, [entityType]);

    // Initialize search terms from location state if available
    const initialSearchTerms = useMemo(() => {
        if (location.state?.searchParams?.searchTerms) {
            return location.state.searchParams.searchTerms;
        }
        return {};
    }, [location.state]);

    // Initialize filters from location state if available
    const initialFilters = useMemo(() => {
        if (location.state?.searchParams?.filters) {
            return location.state.searchParams.filters;
        }
        return DEFAULT_FILTER_STATE;
    }, [location.state]);

    // State for search and sort
    const [searchTerms, setSearchTerms] =
        useState<Record<string, string>>(initialSearchTerms);
    const [isSearching, setIsSearching] = useState(
        !!Object.values(initialSearchTerms).some((v) => v)
    );
    const [sortConfig, setSortConfig] = useState<SortConfig>(
        initialSortConfig || entityConfig.defaultSortConfig
    );
    const [filters, setFilters] = useState(initialFilters);
    const [visualizationVisible, setVisualizationVisible] = useState(false);

    // Use entity-specific variant if none provided
    const effectiveVariant = variant || entityConfig.defaultVariant;

    // Use entity-specific empty messages if none provided
    const effectiveEmptyMessage =
        emptyMessage || entityConfig.defaultEmptyMessage;
    const effectiveSearchEmptyMessage =
        searchEmptyMessage || entityConfig.defaultSearchEmptyMessage;

    // Fetch entities with infinite query for normal browsing mode with user ID
    const infiniteQuery = useInfiniteEntities({
        ...sortConfig,
        userId: user?.user_id,
    });

    // Fetch searched entities, enabled only when searching
    const searchQuery = useSearchEntities
        ? useSearchEntities(
              {
                  searchTerms,
                  filters,
                  sortConfig,
                  userId: user?.user_id,
              },
              isSearching
          )
        : { data: null, isLoading: false, isError: false, error: null };

    // Apply location state search parameters on initial load
    useEffect(() => {
        if (location.state?.searchParams && !isSearching) {
            setSearchTerms(location.state.searchParams.searchTerms || {});
            setFilters(
                location.state.searchParams.filters || DEFAULT_FILTER_STATE
            );
            setSortConfig(
                location.state.searchParams.sortConfig ||
                    entityConfig.defaultSortConfig
            );
            setIsSearching(
                !!Object.values(
                    location.state.searchParams.searchTerms || {}
                ).some((v) => v)
            );

            // Clear location state after applying to prevent re-applying on navigation
            navigate(location.pathname, { replace: true });
        }
    }, [
        location.state,
        isSearching,
        navigate,
        location.pathname,
        entityConfig.defaultSortConfig,
    ]);

    // Determine which data to display
    const entities = useMemo(() => {
        if (isSearching && searchQuery.data) {
            return searchQuery.data.data || [];
        }

        if (infiniteQuery.data) {
            return infiniteQuery.data.pages.flatMap((page: any) => page.data) || [];
        }

        return [];
    }, [isSearching, searchQuery.data, infiniteQuery.data]);

    // Get metadata for displaying total counts
    const metadata = useMemo(() => {
        if (isSearching && searchQuery.data) {
            return searchQuery.data.metadata || { totalCount: 0, count: 0 };
        }

        if (infiniteQuery.data?.pages[0]?.metadata) {
            return infiniteQuery.data.pages[0].metadata || { totalCount: 0, count: 0 };
        }

        return { totalCount: 0, count: 0 };
    }, [isSearching, searchQuery.data, infiniteQuery.data]);

    // Check if we're in a loading state
    const isLoading =
        (infiniteQuery.isLoading && !infiniteQuery.data) ||
        (isSearching && searchQuery.isLoading);

    // Check for errors
    const isError =
        (infiniteQuery.isError && !isSearching) ||
        (isSearching && searchQuery.isError);

    const error = isSearching ? searchQuery.error : infiniteQuery.error;

    // Default render functions based on entity type
    const defaultRenderItem = (item: any) => {
        switch (entityType) {
            case "grant":
                return <GrantCard grant={item as Grant} />;
            case "recipient":
                return (
                    <EntityCard
                        entity={item as Recipient}
                        entityType="recipient"
                        className="h-full"
                    />
                );
            case "institute":
                return (
                    <EntityCard
                        entity={item as Institute}
                        entityType="institute"
                        className="h-full"
                    />
                );
            case "search":
                return (
                    <SearchHistoryCard
                        search={item as SearchHistory}
                        onRerun={
                            onRerunSearch ||
                            ((params) => {
                                navigate("/search", {
                                    state: { searchParams: params },
                                });
                            })
                        }
                        onDelete={(historyId: number) => {
                            /* TODO: Delete logic here */
                        }}
                    />
                );
            default:
                return <div>Unknown entity type</div>;
        }
    };

    // Default key extractor functions based on entity type
    const defaultKeyExtractor = (item: any, index: number) => {
        switch (entityType) {
            case "grant":
                const grant = item as Grant;
                return `grant-${grant.grant_id || grant.ref_number || index}`;
            case "recipient":
                return `recipient-${(item as Recipient).recipient_id || index}`;
            case "institute":
                return `institute-${(item as Institute).institute_id || index}`;
            case "search":
                return `search-${(item as SearchHistory).history_id || index}`;
            default:
                return `entity-${index}`;
        }
    };

    // Use custom render/key functions if provided, otherwise use defaults
    const renderItem = customRenderItem || defaultRenderItem;
    const keyExtractor = customKeyExtractor || defaultKeyExtractor;

    // Create visualization component for grants
    const visualization = useMemo(() => {
        if (
            !allowVisualization ||
            entityType !== "grant" ||
            !entities ||
            entities.length === 0
        )
            return null;

        return (
            <TrendVisualizer
                grants={entities as Grant[]}
                viewContext="search"
                height={350}
                initialChartType="bar-stacked"
                initialMetricType="funding"
            />
        );
    }, [allowVisualization, entityType, entities]);

    // Handle search for grant with full SearchInterface
    const handleGrantsSearch = (params: {
        searchTerms: Record<string, string>;
        filters: typeof DEFAULT_FILTER_STATE;
    }) => {
        setSearchTerms(params.searchTerms);
        setFilters(params.filters);

        // Only set searching true if at least one search term has a value
        const hasSearchTerms = Object.values(params.searchTerms).some(
            (term) => term && term.trim() !== ""
        );
        setIsSearching(hasSearchTerms);

        // Reset visualization when search changes
        setVisualizationVisible(false);
    };

    // Handle simple search for recipients/institutes
    const handleSimpleSearch = () => {
        // Only set searching true if search term has a value
        const hasSearchTerm =
            searchTerms.name && searchTerms.name.trim() !== "";
        setIsSearching(!!hasSearchTerm);

        // Reset filters for simple search
        setFilters(DEFAULT_FILTER_STATE);

        // Reset visualization when search changes
        setVisualizationVisible(false);
    };

    // Handle clearing simple search
    const clearSimpleSearch = () => {
        setSearchTerms({ name: "" });
        setIsSearching(false);
    };

    // Render the appropriate search interface based on entity type
    const renderSearchInterface = () => {
        // For grants, use the full SearchInterface component
        if (entityType === "grant") {
            return (
                <SearchInterface
                    fields={entityConfig.searchFields}
                    initialValues={searchTerms}
                    filters={filters}
                    onSearch={handleGrantsSearch}
                    isInitialState={!isSearching}
                    showPopularSearches={true}
                    className="mb-6"
                />
            );
        }

        // For institutes and recipients, use a simple search field
        else if (entityType === "institute" || entityType === "recipient") {
            return (
                <div className="mb-6 flex gap-2">
                    <div className="flex-1">
                        <div className="relative shadow-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="search"
                                placeholder={entityConfig.searchPlaceholder}
                                value={searchTerms.name || ""}
                                onChange={(e) =>
                                    setSearchTerms({ name: e.target.value })
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSimpleSearch();
                                    }
                                }}
                                className="w-full pl-10 pr-2.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
                            />
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        leftIcon={Search}
                        onClick={handleSimpleSearch}
                        className="bg-gray-900 hover:bg-gray-800"
                    >
                        <span className="hidden lg:inline">Search</span>
                    </Button>
                </div>
            );
        }

        // For search history, don't show any search interface
        else if (entityType === "search") {
            return null;
        }

        // Default fallback
        return null;
    };

    return (
        <PageContainer>
            {/* Header */}
            <PageHeader
                title={title}
                subtitle={
                    subtitle || `Browse and search ${title.toLowerCase()}.`
                }
            />

            {/* Search Interface based on entity type */}
            {renderSearchInterface()}

            {/* Main Entity List */}
            <EntityList
                entityType={entityType}
                entities={entities}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                variant={effectiveVariant}
                sortOptions={entityConfig.sortOptions}
                sortConfig={sortConfig}
                onSortChange={setSortConfig}
                infiniteQuery={isSearching ? null : infiniteQuery}
                isLoading={isLoading}
                isError={isError}
                error={error}
                totalCount={metadata.totalCount}
                totalItems={entities.length}
                emptyMessage={
                    isSearching
                        ? effectiveSearchEmptyMessage
                        : effectiveEmptyMessage
                }
                visualization={visualization}
                visualizationToggle={
                    visualization
                        ? {
                              isVisible: visualizationVisible,
                              toggle: () =>
                                  setVisualizationVisible(
                                      !visualizationVisible
                                  ),
                              showToggleButton: true,
                          }
                        : undefined
                }
                allowLayoutToggle={entityType !== "grant" && entityType !== "search"}
            />
        </PageContainer>
    );
};

export default EntitiesPage;
