// src/pages/BookmarksPage.tsx
import { useState } from "react";
import {
    BookMarked,
    University,
    GraduationCap,
    Search,
    PackageOpen,
    LogIn,
    RefreshCw,
    XCircle,
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
import EntityCard from "@/components/common/ui/EntityCard";
import { GrantCard } from "@/components/features/grants/GrantCard";
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import { SearchHistoryCard } from "@/components/features/account/SearchHistoryCard";
import LoadingState from "@/components/common/ui/LoadingState";
import EmptyState from "@/components/common/ui/EmptyState";
import ErrorState from "@/components/common/ui/ErrorState";
import { BookmarkType } from "@/types/bookmark";
import { cn } from "@/utils/cn";
import { Grant, Institute, Recipient, SearchHistory } from "@/types/models";

// Define the tab structure with correct bookmark types
const tabs = [
    { name: "Grants", icon: BookMarked, type: "grant" as BookmarkType },
    { name: "Institutes", icon: University, type: "institute" as BookmarkType },
    {
        name: "Recipients",
        icon: GraduationCap,
        type: "recipient" as BookmarkType,
    },
    {
        name: "Searches",
        icon: Search,
        type: "search" as BookmarkType,
    },
];

export const BookmarksPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState("Grants");

    // Get the active tab type for the bookmark API
    const activeTabType =
        tabs.find((tab) => tab.name === activeTab)?.type || "grant";

    // Use the hook to get bookmarked item IDs
    const {
        data: bookmarkedIds = [],
        isLoading: isLoadingBookmarks,
        isError: isBookmarksError,
        error: bookmarksError,
        refetch: refetchBookmarks,
    } = useAllBookmarks(activeTabType, user?.user_id);

    // Use the hook to get full bookmarked entities with details
    const {
        data: bookmarkedItems = [],
        isLoading: isLoadingEntities,
        isError: isEntitiesError,
        error: entitiesError,
    } = useBookmarkedEntities(activeTabType, user?.user_id);

    // Set up toggle bookmark mutation
    const toggleBookmarkMutation = useToggleBookmark(activeTabType);

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

    // Render bookmarked entities based on the active tab
    const renderBookmarkedItems = () => {
        // Show appropriate loading state
        if (isLoading) {
            return (
                <LoadingState
                    title={`Loading your bookmarked ${activeTab.toLowerCase()}...`}
                    message="Please wait while we fetch your saved items."
                    fullHeight
                    size="md"
                />
            );
        }

        if (isError) {
            return (
                <ErrorState
                    title="Error Loading Bookmarks"
                    message={
                        errorMessage instanceof Error
                            ? errorMessage.message
                            : "Failed to load your bookmarks."
                    }
                    onRetry={() => refetchBookmarks()}
                    size="md"
                    icon={XCircle}
                />
            );
        }

        if (bookmarkedIds.length === 0) {
            return (
                <EmptyState
                    title={`No bookmarked ${activeTab.toLowerCase()}`}
                    message={`You haven't saved any ${activeTab.toLowerCase()} yet. Browse and click the bookmark icon to save items for later.`}
                    primaryAction={{
                        label:
                            activeTab === "Grants"
                                ? "Browse Grants"
                                : activeTab === "Institutes"
                                ? "Browse Institutes"
                                : activeTab === "Recipients"
                                ? "Browse Recipients"
                                : "Search",
                        onClick: () =>
                            navigate(
                                activeTab === "Grants"
                                    ? "/search"
                                    : activeTab === "Institutes"
                                    ? "/institutes"
                                    : activeTab === "Recipients"
                                    ? "/recipients"
                                    : "/search"
                            ),
                        icon: Search,
                    }}
                    size="md"
                />
            );
        }

        if (bookmarkedItems.length === 0) {
            // This should only happen if we have IDs but couldn't load the details
            return (
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border shadow-sm">
                    <RefreshCw className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No details available
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md text-center">
                        We found your bookmarks, but couldn't load the details.
                        This might be a temporary issue.
                    </p>
                    <Button
                        variant="primary"
                        leftIcon={RefreshCw}
                        onClick={() => refetchBookmarks()}
                    >
                        Try Again
                    </Button>
                </div>
            );
        }

        // Render for searches tab
        if (activeTabType === "search") {
            return (
                <div className="space-y-4">
                    {bookmarkedItems.map((item: any) => (
                        <SearchHistoryCard
                            key={item.history_id}
                            search={item as SearchHistory}
                            onRerun={handleRerunSearch}
                            onDelete={(historyId) => toggleBookmark(historyId)}
                        />
                    ))}
                </div>
            );
        }

        // Render the grid of bookmarked items for other tab types
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarkedItems.map((item: any) => {
                    // Render different entity cards based on the active tab
                    if (activeTabType === "grant") {
                        return (
                            <GrantCard
                                key={item.grant_id || item.ref_number}
                                grant={item as Grant}
                                isBookmarked={true}
                                onBookmark={() =>
                                    toggleBookmark(
                                        item.grant_id || item.ref_number
                                    )
                                }
                            />
                        );
                    } else if (activeTabType === "institute") {
                        return (
                            <EntityCard
                                key={item.institute_id}
                                entity={item as Institute}
                                entityType="institute"
                                isBookmarked={true}
                                onBookmark={() =>
                                    toggleBookmark(item.institute_id)
                                }
                            />
                        );
                    } else if (activeTabType === "recipient") {
                        return (
                            <EntityCard
                                key={item.recipient_id}
                                entity={item as Recipient}
                                entityType="recipient"
                                isBookmarked={true}
                                onBookmark={() =>
                                    toggleBookmark(item.recipient_id)
                                }
                            />
                        );
                    }
                    return null;
                })}
            </div>
        );
    };

    return (
        <PageContainer>
            {/* Header */}
            <PageHeader
                title="Bookmarks"
                subtitle="Find and manage your saved bookmarks here."
            />

            {/* Tabs */}
            <div className="flex space-x-2 lg:space-x-4">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.name;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
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

            {/* Tab Content */}
            <div className="mt-6">{renderBookmarkedItems()}</div>
        </PageContainer>
    );
};

export default BookmarksPage;
