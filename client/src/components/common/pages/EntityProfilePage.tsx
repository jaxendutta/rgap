// src/components/common/pages/EntityProfilePage.tsx
import Tabs, { TabItem } from "@/components/common/ui/Tabs";
import LoadingState from "@/components/common/ui/LoadingState";
import ErrorState from "@/components/common/ui/ErrorState";
import PageContainer from "../layout/PageContainer";
import { useAllBookmarks, useToggleBookmark } from "@/hooks/api/useBookmarks";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import { BookmarkType } from "@/types/bookmark";

export interface EntityProfilePageProps {
    // Core data and state
    entity: any;
    entityType: "recipient" | "institute";
    entityTypeLabel: string;
    isLoading: boolean;
    isError: boolean;
    error?: Error | unknown;

    // Header and stats content
    renderHeader: (
        isBookmarked: boolean,
        toggleBookmark: () => void
    ) => React.ReactNode;
    renderStats: () => React.ReactNode;

    // Tabs and content
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;

    // Tab content renderers
    renderTabContent: (tabId: string) => React.ReactNode;
}

const EntityProfilePage = ({
    entity,
    entityType,
    entityTypeLabel,
    isLoading,
    isError,
    error,
    renderHeader,
    renderStats,
    tabs,
    activeTab,
    onTabChange,
    renderTabContent,
}: EntityProfilePageProps) => {
    // Use bookmark hooks
    const bookmarkType = entityType as BookmarkType;
    const { user } = useAuth();
    const { showNotification } = useNotification();

    // Get entity ID based on entity type
    const entityId = entity
        ? entityType === "institute"
            ? entity.institute_id
            : entity.recipient_id
        : null;

    // Get bookmarked IDs for this entity type
    const { data: bookmarkedIds = [] } = useAllBookmarks(
        bookmarkType,
        user?.user_id
    );
    const toggleBookmarkMutation = useToggleBookmark(bookmarkType);

    // Check if current entity is bookmarked
    const isBookmarked = entityId ? bookmarkedIds.includes(entityId) : false;

    // Toggle bookmark handler
    const handleToggleBookmark = () => {
        if (!user?.user_id) {
            showNotification(
                "You must be logged in to bookmark items",
                "error"
            );
            return;
        }

        if (!entityId) {
            showNotification("Cannot bookmark this item", "error");
            return;
        }

        toggleBookmarkMutation.mutate({
            user_id: user.user_id,
            entity_id: entityId,
            isBookmarked: isBookmarked,
        });
    };

    // Handle the error state
    if (isError) {
        return (
            <PageContainer>
                <ErrorState
                    title={`Error Loading ${entityTypeLabel}`}
                    message={
                        error instanceof Error
                            ? error.message
                            : `Failed to load ${entityType} details. Please try again.`
                    }
                    variant="default"
                    size="lg"
                    onBack={() => window.history.back()}
                />
            </PageContainer>
        );
    }

    // Handle the loading state
    if (isLoading || !entity) {
        return (
            <PageContainer>
                <LoadingState
                    title={`Loading ${entityTypeLabel} details...`}
                    fullHeight
                    size="lg"
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Header with profile and quick stats */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Top section with entity details */}
                {renderHeader(isBookmarked, handleToggleBookmark)}

                {/* Stats section */}
                {renderStats()}
            </div>

            {/* Tabs for page content */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Tab navigation */}
                <div className="border-b border-gray-200">
                    <Tabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={onTabChange}
                        variant="underline"
                        fullWidth={true}
                    />
                </div>

                {/* Tab content */}
                <div className="p-4 lg:p-6">{renderTabContent(activeTab)}</div>
            </div>
        </PageContainer>
    );
};

export default EntityProfilePage;
