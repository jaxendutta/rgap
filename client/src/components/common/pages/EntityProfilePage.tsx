// src/components/common/pages/EntityProfilePage.tsx
import { useState } from "react";
import Tabs, { TabItem } from "@/components/common/ui/Tabs";
import LoadingState from "@/components/common/ui/LoadingState";
import ErrorState from "@/components/common/ui/ErrorState";

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
    // Local state for bookmarking
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Toggle bookmark handler
    const toggleBookmark = () => setIsBookmarked(!isBookmarked);

    // Handle the error state
    if (isError) {
        return (
            <div className="max-w-7xl mx-auto p-4 lg:p-6">
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
            </div>
        );
    }

    // Handle the loading state
    if (isLoading || !entity) {
        return (
            <div className="max-w-7xl mx-auto p-4 lg:p-6 h-64">
                <LoadingState
                    title={`Loading ${entityTypeLabel} details...`}
                    fullHeight
                    size="lg"
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-1 lg:p-6 space-y-6">
            {/* Header with profile and quick stats */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Top section with entity details */}
                {renderHeader(isBookmarked, toggleBookmark)}

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
        </div>
    );
};

export default EntityProfilePage;
