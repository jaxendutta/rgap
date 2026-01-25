// src/app/(dashboard)/bookmarks/client.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    LuSearch, LuGraduationCap, LuUniversity, LuBookMarked, LuHash,
    LuCalendarDays,
} from "react-icons/lu";
import { MdSortByAlpha } from 'react-icons/md';
import Tabs, { TabContent, TabItem } from "@/components/ui/Tabs";
import GrantCard from "@/components/grants/GrantCard";
import BookmarkedEntityCard from "@/components/bookmarks/BookmarkedEntityCard";
import NoteEditor from "@/components/bookmarks/NoteEditor";
import { updateGrantNote, updateSearchNote } from "@/app/actions/bookmarks";
import EntityList from "@/components/entity/EntityList";
import { SortOption } from "@/types/database";
import SearchHistoryItem from "@/components/account/SearchHistoryItem";

interface BookmarksClientProps {
    grants: any[];
    recipients: any[];
    institutes: any[];
    searches: any[];
    initialTab?: string;
}

export default function BookmarksClient({ grants, recipients, institutes, searches, initialTab = "grants" }: BookmarksClientProps) {
    const [activeTab, setActiveTabState] = useState(initialTab);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Sync tab changes to URL
    const setActiveTab = (id: string) => {
        setActiveTabState(id);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', id);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleSearchAgain = (item: any) => {
        // Redirect to search page with the query and re-run flag
        router.push(`/search?q=${encodeURIComponent(item.search_query || '')}&re-run=true`);
    };

    const tabItems: TabItem[] = [
        { id: "grants", label: "Grants", icon: LuBookMarked, count: grants.length },
        { id: "recipients", label: "Recipients", icon: LuGraduationCap, count: recipients.length },
        { id: "institutes", label: "Institutes", icon: LuUniversity, count: institutes.length },
        { id: "searches", label: "Searches", icon: LuSearch, count: searches.length },
    ];

    const searchBookmarkSortOptions: SortOption[] = [
        { value: 'bookmarked_at', label: 'Date Bookmarked', field: 'bookmarked_at', direction: 'desc', icon: LuCalendarDays },
        { value: 'results_count', label: 'Results', field: 'results_count', direction: 'desc', icon: LuHash },
    ];
    const bookmarkSortOptions: SortOption[] = [
        { value: 'bookmarked_at', label: 'Date Bookmarked', field: 'bookmarked_at', direction: 'desc', icon: LuCalendarDays },
        { value: 'legal_name', label: 'Name', field: 'legal_name', direction: 'asc', icon: MdSortByAlpha },
    ];

    return (
        <div className="w-full">
            <Tabs
                tabs={tabItems}
                activeTab={activeTab}
                onChange={setActiveTab}
                variant="pills"
                className="mb-6"
                showCounts={true}
                fullWidth
            />

            <div>
                <TabContent activeTab={activeTab}>
                    {/* Grants Tab - With Visualization Enabled */}
                    {activeTab === "grants" && (
                        <EntityList
                            entityType="grant"
                            entities={grants}
                            totalCount={grants.length}
                            emptyMessage="You haven't bookmarked any grants yet."
                            sortOptions={bookmarkSortOptions}
                            showVisualization={true}
                            visualizationData={grants}
                            viewContext="custom"
                        >
                            {grants.map((grant) => (
                                <div key={grant.grant_id} className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                                    <div className="flex-1">
                                        <GrantCard {...grant} isBookmarked={true} />
                                    </div>
                                    <div className="px-2 md:px-4 py-2 lg:py-3 bg-gray-50/50 rounded-b-2xl">
                                        <NoteEditor
                                            initialNote={grant.notes}
                                            onSave={(note) => updateGrantNote(grant.grant_id, note)}
                                            placeholder="Add notes about this bookmarked grant..."
                                        />
                                    </div>
                                </div>
                            ))}
                        </EntityList>
                    )}

                    {/* Recipients Tab */}
                    {activeTab === "recipients" && (
                        <EntityList
                            entityType="recipient"
                            entities={recipients}
                            totalCount={recipients.length}
                            emptyMessage="No recipients saved."
                            sortOptions={bookmarkSortOptions}
                        >
                            {recipients.map((recipient) => (
                                <BookmarkedEntityCard
                                    key={recipient.recipient_id}
                                    data={recipient}
                                    type="recipient"
                                />
                            ))}
                        </EntityList>
                    )}

                    {/* Institutes Tab */}
                    {activeTab === "institutes" && (
                        <EntityList
                            entityType="institute"
                            entities={institutes}
                            totalCount={institutes.length}
                            emptyMessage="No institutes saved."
                            sortOptions={bookmarkSortOptions}
                        >
                            {institutes.map((institute) => (
                                <BookmarkedEntityCard
                                    key={institute.institute_id}
                                    data={institute}
                                    type="institute"
                                />
                            ))}
                        </EntityList>
                    )}

                    {/* Searches Tab - Refactored to use SearchHistoryItem */}
                    {activeTab === "searches" && (
                        <EntityList
                            entityType="search"
                            entities={searches}
                            totalCount={searches.length}
                            emptyMessage="No saved searches."
                            sortOptions={searchBookmarkSortOptions}
                            showLayoutToggle={false}
                            initialLayoutVariant="list"
                        >
                            {searches.map((search) => (
                                <div className="mb-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col" key={search.id}>
                                    <div key={search.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                                        <SearchHistoryItem
                                            item={search}
                                            onSearchAgain={handleSearchAgain}
                                            isBookmarked={true}
                                        />
                                    </div>
                                    <div className="px-2 md:px-4 py-2 lg:py-3 bg-gray-50/50 rounded-b-2xl">
                                        <NoteEditor
                                            initialNote={search.notes}
                                            onSave={(note) => updateSearchNote(search.id, note)}
                                            placeholder="Notes about this bookmarked search query..."
                                        />
                                    </div>
                                </div>
                            ))}
                        </EntityList>
                    )}
                </TabContent>
            </div>
        </div>
    );
}
