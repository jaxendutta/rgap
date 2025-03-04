// src/pages/BookmarksPage.tsx
import { useState } from "react";
import { BookMarked, University, GraduationCap, Search } from "lucide-react";
import { clsx } from "clsx";
import PageContainer from "@/components/common/layout/PageContainer";
import PageHeader from "@/components/common/layout/PageHeader";

const tabs = [
    { name: "Grants", icon: BookMarked },
    { name: "Institutes", icon: University },
    { name: "Recipients", icon: GraduationCap },
    { name: "Searches", icon: Search },
];

export const BookmarksPage = () => {
    const [activeTab, setActiveTab] = useState("Grants");

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
                            className={clsx(
                                "w-full flex items-center py-3 rounded-lg transition-all duration-200 gap-0.5 lg:gap-2",
                                isActive
                                    ? "bg-gray-900 text-white"
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
            <div className="mt-6">
                {activeTab === "Grants" && (
                    <div className="text-gray-500">
                        No bookmarked grants yet.
                    </div>
                )}
                {activeTab === "Institutes" && (
                    <div className="text-gray-500">
                        No bookmarked research institutes yet.
                    </div>
                )}
                {activeTab === "Recipients" && (
                    <div className="text-gray-500">
                        No bookmarked recipients yet.
                    </div>
                )}
                {activeTab === "Searches" && (
                    <div className="text-gray-500">
                        No bookmarked searches yet.
                    </div>
                )}
            </div>
        </PageContainer>
    );
};
