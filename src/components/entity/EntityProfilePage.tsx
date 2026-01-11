// src/components/layout/EntityProfilePage.tsx
'use client';

import React, { useState } from "react";
import Tabs, { TabItem } from "@/components/ui/Tabs"; // Assuming you have this
import PageContainer from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";

export interface EntityProfilePageProps {
    header: React.ReactNode;
    stats: React.ReactNode;
    tabs: TabItem[];
    tabContent: Record<string, React.ReactNode>;
    defaultTab?: string;
}

const EntityProfilePage: React.FC<EntityProfilePageProps> = ({
    header,
    stats,
    tabs,
    tabContent,
    defaultTab = 'overview'
}) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
        <PageContainer>
            {/* Header with profile and quick stats */}
            <Card className="mb-6 overflow-hidden">
                {header}
                {stats}
            </Card>

            {/* Tabs and Content */}
            <Card className="flex flex-col gap-6 bg-slate-50 p-4 lg:p-6 overflow-hidden min-h-[500px]">
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    variant="underline"
                />

                <div className="animate-in fade-in duration-300">
                    {tabContent[activeTab]}
                </div>
            </Card>
        </PageContainer>
    );
};

export default EntityProfilePage;
