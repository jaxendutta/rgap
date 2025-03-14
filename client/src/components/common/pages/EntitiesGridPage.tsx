// src/components/common/pages/EntitiesGridPage.tsx
import { useState, useMemo } from "react";
import {
    Search,
    X,
    AlertTriangle,
} from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import EntityCard, { EntityType } from "@/components/common/ui/EntityCard";
import PageContainer from "@/components/common/layout/PageContainer";
import PageHeader from "@/components/common/layout/PageHeader";
import { SearchField } from "@/components/common/ui/SearchField";
import { Button } from "@/components/common/ui/Button";
import LoadingState from "@/components/common/ui/LoadingState";
import EmptyState from "@/components/common/ui/EmptyState";
import ErrorState from "@/components/common/ui/ErrorState";
import { Institute, Recipient } from "@/types/models";
import { cn } from "@/utils/cn";
import { useAllBookmarks, useToggleBookmark } from "@/hooks/api/useBookmarks";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/components/features/notifications/NotificationProvider";

interface EntitiesGridPageProps {
    entityType: EntityType;
    title: string;
    subtitle?: string;
    useInfiniteEntities: any; // The infinite query hook
    useSearchEntities?: any; // The search query hook
    onBookmark?: (id: number) => void;
    searchPlaceholder?: string;
    emptyMessage?: string;
    searchEmptyMessage?: string;
    initialFilters?: Record<string, any>;
}

const EntitiesGridPage = ({
    entityType,
    title,
    subtitle,
    useInfiniteEntities,
    useSearchEntities,
    onBookmark,
    searchPlaceholder = "Search by name...",
    emptyMessage = "No entities found.",
    searchEmptyMessage = "No entities match your search.",
}: EntitiesGridPageProps) => {
    // State for search query
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    //const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

    const { user } = useAuth();
    const user_id = user?.user_id;

    const { data: bookmarkedIds = [], isLoading: isLoadingBookmarks, isError: isGetBookmarksError, } = useAllBookmarks(entityType, user_id,);
    const toggleBookmarkMutation = useToggleBookmark(entityType);

    const { showNotification } = useNotification();

    // Setup intersection observer for infinite loading
    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: "0px 0px 500px 0px", // Trigger 500px before reaching the end
    });

    // Fetch entities with infinite query
    const infiniteQuery = useInfiniteEntities();

    // Fetch searched entities, enabled only when searching
    const searchQuery$ = useSearchEntities
        ? useSearchEntities(searchQuery, isSearching)
        : { data: null, isLoading: false, isError: false, error: null };

    // Determine which data to display
    const entities = useMemo(() => {
        if (isSearching && searchQuery$.data) {
            return searchQuery$.data.data;
        }

        if (infiniteQuery.data) {
            return infiniteQuery.data.pages.flatMap((page: any) => page.data);
        }

        return [];
    }, [isSearching, searchQuery$.data, infiniteQuery.data]);

    // Get metadata for displaying total counts
    const metadata = useMemo(() => {
        if (isSearching && searchQuery$.data) {
            return searchQuery$.data.metadata;
        }

        if (infiniteQuery.data?.pages[0]?.metadata) {
            return infiniteQuery.data.pages[0].metadata;
        }

        return { totalCount: 0, count: 0 };
    }, [isSearching, searchQuery$.data, infiniteQuery.data]);

    // Check if we're in a loading state
    const isLoading =
        (infiniteQuery.isLoading && !infiniteQuery.data) ||
        (isSearching && searchQuery$.isLoading) ||
        (isLoadingBookmarks);

    // Check for errors
    const isError =
        (infiniteQuery.isError && !isSearching) ||
        (isSearching && searchQuery$.isError) ||
        (isGetBookmarksError);

    const error = isSearching ? searchQuery$.error : infiniteQuery.error;

    // Load more data when reaching the bottom
    useEffect(() => {
        if (
            inView &&
            !isSearching &&
            infiniteQuery.hasNextPage &&
            !infiniteQuery.isFetchingNextPage
        ) {
            infiniteQuery.fetchNextPage();
        }
    }, [inView, infiniteQuery, isSearching]);

    // Handle search
    const handleSearch = () => {
        if (searchQuery.trim()) {
            setIsSearching(true);
        } else {
            setIsSearching(false);
        }
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery("");
        setIsSearching(false);
    };

    // Handle bookmarks
    const toggleBookmark = (id: number) => {
        if (!user_id) {
            showNotification(
                "You must be logged in to bookmark.",
                "error",
            );
            return;
        }
        const isBookmarked = bookmarkedIds.includes(id);
        //console.log(`toggleBookmark: isBookmarked:${isBookmarked}`);
        //console.log(bookmarkedIds)
        
        // Trigger the mutation
        toggleBookmarkMutation.mutate({ user_id: user_id, entity_id: id, isBookmarked });
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

            {/* Search Bar */}
            <div className="mb-6 flex flex-col lg:flex-row gap-2">
                <div className="flex-1">
                    <SearchField
                        icon={Search}
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onEnter={handleSearch}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="primary"
                        icon={Search}
                        onClick={handleSearch}
                        className="bg-gray-900 hover:bg-gray-800 flex-1 lg:flex-auto rounded-full"
                    >
                        Search
                    </Button>
                    {isSearching && (
                        <Button
                            variant="outline"
                            icon={X}
                            onClick={clearSearch}
                            className="flex-1 lg:flex-auto rounded-full"
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Info Bar */}
            {!isLoading && !isError && entities.length > 0 && (
                <div className="mb-4 text-sm flex justify-between items-center text-gray-600 border-b pb-2">
                    <div>
                        Showing{" "}
                        <span className="font-medium">{entities.length.toLocaleString()}</span>{" "}
                        of{" "}
                        <span className="font-medium">
                            {metadata.totalCount.toLocaleString()}
                        </span>{" "}
                        {title.toLowerCase()}
                    </div>
                    {isSearching && (
                        <div className="flex items-center bg-blue-50 text-blue-800 rounded-full px-3 py-1 text-xs">
                            <Search className="h-3 w-3 mr-1" />
                            {searchQuery}
                        </div>
                    )}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <LoadingState
                    title={`Loading ${title}...`}
                    message="Please wait while we fetch the data."
                    fullHeight
                    size="lg"
                />
            )}

            {/* Error State */}
            {isError && (
                <ErrorState
                    title={`Error Loading ${title}`}
                    message={
                        error instanceof Error
                            ? error.message
                            : "An unexpected error occurred."
                    }
                    variant="default"
                    size="lg"
                    onRetry={() =>
                        isSearching ? handleSearch() : infiniteQuery.refetch()
                    }
                />
            )}

            {/* Empty State */}
            {!isLoading && !isError && entities.length === 0 && (
                <EmptyState
                    title={
                        isSearching ? "No Search Results" : `No ${title} Found`
                    }
                    message={isSearching ? searchEmptyMessage : emptyMessage}
                    icon={isSearching ? Search : AlertTriangle}
                    size="lg"
                    primaryAction={
                        isSearching
                            ? {
                                label: "Clear Search",
                                onClick: clearSearch,
                                icon: X,
                            }
                            : undefined
                    }
                />
            )}

            {/* Entities Grid */}
            {!isLoading && !isError && entities.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {entities.map((entity: Institute | Recipient) => {
                        const id =
                            entityType === "institute"
                                ? (entity as Institute).institute_id
                                : (entity as Recipient).recipient_id;

                        return (
                            <EntityCard
                                key={`${entityType}-${id}`}
                                entity={entity}
                                entityType={entityType}
                                isBookmarked={bookmarkedIds.includes(id)}
                                onBookmark={() => toggleBookmark(id)}
                            />
                        );
                    })}
                </div>
            )}

            {/* Load More Trigger - Bottom of List */}
            {!isLoading && !isError && !isSearching && entities.length > 0 && (
                <div
                    ref={ref}
                    className={cn(
                        "mt-8 flex justify-center",
                        infiniteQuery.isFetchingNextPage ? "py-4" : "py-2"
                    )}
                >
                    {infiniteQuery.isFetchingNextPage ? (
                        <LoadingState
                            message={`Loading more ${title.toLowerCase()}...`}
                            size="sm"
                        />
                    ) : infiniteQuery.hasNextPage ? (
                        <Button
                            variant="outline"
                            onClick={() => infiniteQuery.fetchNextPage()}
                        >
                            Load More
                        </Button>
                    ) : (
                        <span className="text-sm text-gray-500">
                            All {title.toLowerCase()} loaded
                        </span>
                    )}
                </div>
            )}
        </PageContainer>
    );
};

export default EntitiesGridPage;
