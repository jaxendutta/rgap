// src/pages/BookmarksPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookMarked,
    University,
    GraduationCap,
    Search,
    Calendar,
    DollarSign,
    Hash,
} from "lucide-react";
import { cn } from "@/utils/cn";
import PageContainer from "@/components/common/layout/PageContainer";
import PageHeader from "@/components/common/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
    useAllBookmarks,
    useBookmarkedEntities,
} from "@/hooks/api/useBookmarks";
import { Entity } from "@/types/models";
import EntityCard from "@/components/common/ui/EntityCard";
import { GrantCard } from "@/components/features/grants/GrantCard";
import EntityList from "@/components/common/ui/EntityList";
import EmptyState from "@/components/common/ui/EmptyState";
import { SearchHistoryCard } from "@/components/features/account/SearchHistoryCard";

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
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Entity>("grant");

    // Use the hook to get bookmarked item IDs
    const {
        isLoading: isLoadingBookmarks,
        isError: isBookmarksError,
        error: bookmarksError,
    } = useAllBookmarks(activeTab, user?.user_id);

    // Use the hook to get full bookmarked entities with details
    const {
        data: bookmarkedItems = [],
        isLoading: isLoadingEntities,
        isError: isEntitiesError,
        error: entitiesError,
    } = useBookmarkedEntities(activeTab, user?.user_id);

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
                return <SearchHistoryCard data={item} />;
            default:
                return null;
        }
    };

    // Entity-specific key extractors
    const keyExtractor = (item: any) => {
        switch (activeTab) {
            case "grant":
                return item.grant_id;
            case "recipient":
                return item.recipient_id;
            case "institute":
                return item.institute_id;
            case "search":
                return item.history_id;
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
                        icon: Calendar,
                    },
                    { field: "agreement_value", label: "Value", icon: Search },
                ];
            case "recipient":
            case "institute":
                return [
                    {
                        field: "total_funding",
                        label: "Funding",
                        icon: DollarSign,
                    },
                    { field: "grant_count", label: "Grants", icon: BookMarked },
                ];
            case "search":
                return [
                    { field: "search_time", label: "Date", icon: Calendar },
                    { field: "result_count", label: "Results", icon: Hash },
                ];
            default:
                return [];
        }
    };

    // Check for loading or error states
    const isLoading = isLoadingBookmarks || isLoadingEntities;
    const isError = isBookmarksError || isEntitiesError;
    const errorMessage = bookmarksError || entitiesError;

    return (
        <PageContainer className="h-full">
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
                initialSortConfig={{ field: "date", direction: "desc" }}
                totalCount={bookmarkedItems.length}
                totalItems={bookmarkedItems.length}
                emptyState={
                    <EmptyState
                        title={`Uh oh!`}
                        message={`You have no bookmarked ${activeTab}s.`}
                        variant="card"
                        className="w-full"
                        titleClassName="text-xl"
                        messageClassName="text-base"
                        primaryAction={{
                            label: "Let's go bookmark some!",
                            onClick: () => {
                                if (activeTab === "recipient") {
                                    navigate("/recipients");
                                } else if (activeTab === "institute") {
                                    navigate("/institutes");
                                } else {
                                    navigate("/search");
                                }
                            },
                            icon: Search,
                        }}
                    />
                }
                isLoading={isLoading}
                isError={isError}
                error={errorMessage}
            />
        </PageContainer>
    );
};

export default BookmarksPage;
