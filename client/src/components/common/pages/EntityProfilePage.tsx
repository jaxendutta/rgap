// src/components/common/pages/EntityProfilePage.tsx
import React from "react";
import Tabs, { TabItem } from "@/components/common/ui/Tabs";
import LoadingState from "@/components/common/ui/LoadingState";
import ErrorState from "@/components/common/ui/ErrorState";
import PageContainer from "../layout/PageContainer";
import { Card } from "@/components/common/ui/Card";
import { useNavigate } from "react-router-dom";

export interface EntityProfilePageProps {
    // Core data and state
    entity: any;
    entityType: "recipient" | "institute";
    isLoading: boolean;
    isError: boolean;
    error?: Error | unknown;

    // Header and stats content
    renderHeader: () => React.ReactNode;
    renderStats: () => React.ReactNode;

    // Tabs and content
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;

    // Tab content renderers
    renderTabContent: (tabId: string) => React.ReactNode;
}

const EntityProfilePage: React.FC<EntityProfilePageProps> = ({
    entity,
    entityType,
    isLoading,
    isError,
    error,
    renderHeader,
    renderStats,
    tabs,
    activeTab,
    onTabChange,
    renderTabContent,
}) => {
    const navigate = useNavigate();

    // Handle the error state
    if (isError) {
        return (
            <PageContainer>
                <ErrorState
                    title={`Error Loading ${entityType}`}
                    message={
                        error instanceof Error
                            ? error.message
                            : `Failed to load ${entityType} details. Please try again.`
                    }
                    variant="default"
                    size="lg"
                    onRetry={() => navigate(0)} // Refresh page
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
                    title={`Loading ${entityType} details...`}
                    message="Please wait while we fetch the data..."
                    fullHeight
                    size="lg"
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Header with profile and quick stats */}
            <Card className="mb-6 overflow-hidden">
                {/* Top section with entity details */}
                {renderHeader()}

                {/* Stats section */}
                {renderStats()}
            </Card>

            {/* Tabs and Content */}
            <Card className="overflow-hidden">
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
                <div className="p-4 lg:p-6 bg-slate-100">{renderTabContent(activeTab)}</div>
            </Card>
        </PageContainer>
    );
};

export default EntityProfilePage;
