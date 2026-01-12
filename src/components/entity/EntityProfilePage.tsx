// src/components/entity/EntityProfilePage.tsx
'use client';

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import Tabs, { TabItem } from "@/components/ui/Tabs";
import PageContainer from "@/components/layout/PageContainer";

export interface EntityProfilePageProps {
    // Header and stats content
    renderHeader: () => React.ReactNode;
    renderStats: () => React.ReactNode;

    // Tabs and content
    tabs: TabItem[];
    defaultTab?: string;

    // Tab content renderers
    renderTabContent: (tabId: string) => React.ReactNode;
}

/**
 * EntityProfilePage - Reusable layout for entity detail pages
 * Works for both institutes and recipients
 * Follows render props pattern for flexibility
 */
const EntityProfilePage: React.FC<EntityProfilePageProps> = ({
    renderHeader,
    renderStats,
    tabs,
    defaultTab,
    renderTabContent,
}) => {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

    return (
        <PageContainer>
            {/* Header with profile and quick stats */}
            <Card className="mb-6 overflow-hidden">
                {/* Entity header (name, location, actions) */}
                {renderHeader()}

                {/* Stats section */}
                {renderStats()}
            </Card>

            {/* Tabs and Content */}
            <Card className="flex flex-col gap-6 bg-slate-50 p-4 lg:p-6 overflow-hidden min-h-[500px]">
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    variant="underline"
                    size="sm"
                />

                <div className="animate-in fade-in duration-300">
                    {renderTabContent(activeTab)}
                </div>
            </Card>
        </PageContainer>
    );
};

export default EntityProfilePage;
