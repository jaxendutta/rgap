// src/pages/BookmarksPage.tsx
import { useState } from "react";
import {
    BookMarked,
    University,
    GraduationCap,
    Search,
    PackageOpen,
    LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/common/layout/PageContainer";
import PageHeader from "@/components/common/layout/PageHeader";
import { Button } from "@/components/common/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import {
    useAllBookmarks,
    useToggleBookmark,
    useBookmarkedEntities,
} from "@/hooks/api/useBookmarks";
import EntityList from "@/components/common/ui/EntityList";
import EntityCard from "@/components/common/ui/EntityCard";
import { GrantCard } from "@/components/features/grants/GrantCard";
import { SearchHistoryCard } from "@/components/features/account/SearchHistoryCard";
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import { Entity } from "@/types/models";
import { cn } from "@/utils/cn";

// Define the tab structure with correct bookmark types
interface TabDefinition {
    id: Entity;
    name: string;
    icon: React.ElementType;
}

const tabs: TabDefinition[] = [
    { id: "grant", name: "Grants", icon: BookMarked },
    { id: "institute", name: "Institutes", icon: University },
    { id: "recipient", name: "Recipients", icon: GraduationCap },
    { id: "search", name: "Searches", icon: Search },
];

export const BookmarksPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState<Entity>("grant");

    // Use the hook to get bookmarked item IDs
    const {
        isLoading: isLoadingBookmarks,
        isError: isBookmarksError,
        error: bookmarksError,
        refetch: refetchBookmarks,
    } = useAllBookmarks(activeTab, user?.user_id);

    // Use the hook to get full bookmarked entities with details
    const {
        data: bookmarkedItems = [],
        isLoading: isLoadingEntities,
        isError: isEntitiesError,
        error: entitiesError,
    } = useBookmarkedEntities(activeTab, user?.user_id);

    // Set up toggle bookmark mutation
    const toggleBookmarkMutation = useToggleBookmark(activeTab);

    // Handle bookmarks
    const toggleBookmark = (id: number | string) => {
        if (!user || !user.user_id) {
            showNotification(
                "You must be logged in to manage bookmarks",
                "error"
            );
            return;
        }

        const isBookmarked = true; // Since we're on the bookmarks page, we're removing bookmarks

        // Trigger the mutation
        toggleBookmarkMutation.mutate(
            {
                user_id: user.user_id,
                entity_id: id,
                isBookmarked,
            },
            {
                onSuccess: () => {
                    // Refresh bookmark data after toggle
                    refetchBookmarks();
                },
            }
        );
    };

    // Handle search rerun
    const handleRerunSearch = (searchParams: any) => {
        navigate("/search", { state: { searchParams } });
    };

    // Entity-specific render functions
    const renderItem = (item: any) => {
        switch (activeTab) {
            case "grant":
                return <GrantCard grant={item} isBookmarked={true} />;
            case "recipient":
                return (
                    <EntityCard
                        entity={item}
                        entityType="recipient"
                        isBookmarked={true}
                    />
                );
            case "institute":
                return (
                    <EntityCard
                        entity={item}
                        entityType="institute"
                        isBookmarked={true}
                    />
                );
            case "search":
                return (
                    <SearchHistoryCard
                        search={item}
                        onRerun={handleRerunSearch}
                        onDelete={(historyId) => toggleBookmark(historyId)}
                    />
                );
            default:
                return null;
        }
    };

    // Entity-specific key extractors
    const keyExtractor = (item: any) => {
        switch (activeTab) {
            case "grant":
                return `bookmarked-grant-${item.grant_id || item.ref_number}`;
            case "recipient":
                return `bookmarked-recipient-${item.recipient_id}`;
            case "institute":
                return `bookmarked-institute-${item.institute_id}`;
            case "search":
                return `bookmarked-search-${item.history_id}`;
            default:
                return `bookmark-${Math.random()}`;
        }
    };

    // Define sort options based on active tab
    const getSortOptions = () => {
        switch (activeTab) {
            case "grant":
                return [
                    {
                        field: "agreement_start_date",
                        label: "Date",
                        icon: Search,
                    },
                    { field: "agreement_value", label: "Value", icon: Search },
                ];
            case "recipient":
            case "institute":
                return [
                    { field: "total_funding", label: "Funding", icon: Search },
                    { field: "grant_count", label: "Grants", icon: Search },
                ];
            case "search":
                return [
                    { field: "search_time", label: "Date", icon: Search },
                    { field: "result_count", label: "Results", icon: Search },
                ];
            default:
                return [];
        }
    };

    // Check for loading or error states
    const isLoading = isLoadingBookmarks || isLoadingEntities;
    const isError = isBookmarksError || isEntitiesError;
    const errorMessage = bookmarksError || entitiesError;

    // If user is not logged in, show sign-in prompt
    if (!user) {
        return (
            <PageContainer>
                <PageHeader
                    title="Bookmarks"
                    subtitle="Sign in to view and manage your bookmarks."
                />

                <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg border shadow-sm">
                    <PackageOpen className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Sign in to use bookmarks
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md text-center">
                        You need to be signed in to save and view bookmarks.
                        Sign in or create an account to get started.
                    </p>
                    <Button
                        variant="primary"
                        leftIcon={LogIn}
                        onClick={() => navigate("/auth")}
                    >
                        Sign In
                    </Button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Header */}
            <PageHeader
                title="Bookmarks"
                subtitle="Find and manage your saved bookmarks here."
            />

            {/* Tabs */}
            <div className="flex space-x-2 lg:space-x-4 mb-6">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center py-3 rounded-lg transition-all duration-200 gap-0.5 lg:gap-2",
                                isActive
                                    ? "bg-gray-900 text-white hover:bg-gray-800"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                                "flex-col lg:flex-row",
                                "px-2 lg:px-4",
                                "text-sm lg:text-base"
                            )}
                        >
                            <Icon className="h-6 w-6 mb-1 sm:mb-0" />
                            <span>{tab.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Entity List */}
            <EntityList
                entityType={activeTab}
                entities={bookmarkedItems}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                variant={
                    activeTab === "search" || activeTab === "grant"
                        ? "list"
                        : "grid"
                }
                sortOptions={getSortOptions()}
                sortConfig={{ field: "date", direction: "desc" }}
                onSortChange={() => {}} // Bookmarks don't need sorting for now
                totalCount={bookmarkedItems.length}
                totalItems={bookmarkedItems.length}
                emptyMessage={`No bookmarked ${activeTab}s found.`}
                isLoading={isLoading}
                isError={isError}
                error={errorMessage}
            />
        </PageContainer>
    );
};

export default BookmarksPage;
