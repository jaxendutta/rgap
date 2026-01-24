// src/app/(dashboard)/bookmarks/client.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LuSearch, LuGraduationCap, LuUniversity, LuBookMarked, LuCalendarDays } from "react-icons/lu";
import Tabs, { TabContent, TabItem } from "@/components/ui/Tabs";
import GrantCard from "@/components/grants/GrantCard";
import BookmarkedEntityCard from "@/components/bookmarks/BookmarkedEntityCard";
import BookmarkButton from "@/components/bookmarks/BookmarkButton";
import NoteEditor from "@/components/bookmarks/NoteEditor";
import { Button } from "@/components/ui/Button";
import { updateGrantNote, updateSearchNote } from "@/app/actions/bookmarks";
import EntityList from "@/components/entity/EntityList";
import { Card } from "@/components/ui/Card";
import { SortOption } from "@/types/database";
import { MdSortByAlpha } from "react-icons/md";

// NEW: Search Card Component
const BookmarkedSearchCard = ({ search }: { search: any }) => {
    return (
        <Card className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex justify-between items-start gap-4">
                <div>
                    <div className="font-semibold text-lg text-gray-900 line-clamp-1">
                        "{search.search_query}"
                    </div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <span>{search.result_count ? `${search.result_count.toLocaleString()} results` : 'Search query'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <LuCalendarDays className="w-3.5 h-3.5" />
                            {new Date(search.searched_at).toLocaleDateString()}
                        </span>
                    </div>
                    {/* Bookmarked Date Badge */}
                    <div className="mt-2 inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Saved {new Date(search.bookmarked_at).toLocaleDateString()}
                    </div>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Link href={`/search?q=${encodeURIComponent(search.search_query)}`}>
                        <Button size="sm" variant="outline"><LuSearch className="w-4 h-4 mr-2" /> Run</Button>
                    </Link>
                    <BookmarkButton
                        entityType="search"
                        entityId={search.id}
                        isBookmarked={true}
                        hasNote={!!search.notes}
                        showLabel={false}
                    />
                </div>
            </div>
            <div className="p-3 bg-gray-50/50 flex-1">
                <NoteEditor
                    initialNote={search.notes}
                    onSave={(note) => updateSearchNote(search.id, note)}
                    placeholder="Notes about this search query..."
                    label="Personal Notes"
                />
            </div>
        </Card>
    );
};

interface BookmarksClientProps {
    grants: any[];
    recipients: any[];
    institutes: any[];
    searches: any[];
}

export default function BookmarksClient({ grants, recipients, institutes, searches }: BookmarksClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Initialize state from URL or default to "grants"
    const [activeTab, setActiveTab] = useState(() => {
        return searchParams.get('tab') || "grants";
    });

    const tabItems: TabItem[] = [
        { id: "grants", label: "Grants", icon: LuBookMarked, count: grants.length },
        { id: "recipients", label: "Recipients", icon: LuGraduationCap, count: recipients.length },
        { id: "institutes", label: "Institutes", icon: LuUniversity, count: institutes.length },
        { id: "searches", label: "Searches", icon: LuSearch, count: searches.length },
    ];

    // Handle tab change and update URL
    const handleTabChange = (id: string) => {
        setActiveTab(id);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', id);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Common Sort Options for Bookmarks
    const bookmarkSearchSortOptions: SortOption[] = [
        { value: 'bookmarked_at', label: 'Date Bookmarked', field: 'bookmarked_at', direction: 'desc', icon: LuCalendarDays },
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
                onChange={handleTabChange}
                variant="pills"
                className="mb-6"
                showCounts={true}
                fullWidth
            />

            <div>
                <TabContent activeTab={activeTab}>
                    {/* Grants Tab */}
                    {activeTab === "grants" && (
                        <EntityList
                            entityType="grant"
                            entities={grants}
                            totalCount={grants.length}
                            emptyMessage="You haven't bookmarked any grants yet."
                            sortOptions={bookmarkSortOptions}
                            showVisualization={true}
                            visualizationData={grants}
                        >
                            {grants.map((grant) => (
                                <div key={grant.grant_id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
                                    <GrantCard {...grant} isBookmarked={true} />
                                    <div className="px-3 py-2.5 bg-gray-50/50 border-t border-gray-100">
                                        <NoteEditor
                                            initialNote={grant.notes}
                                            onSave={(note) => updateGrantNote(grant.grant_id, note)}
                                            placeholder="Add notes about this grant..."
                                            label="Personal Notes"
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

                    {/* Searches Tab - NOW USING GRID AND NEW CARD */}
                    {activeTab === "searches" && (
                        <EntityList
                            entityType="search"
                            entities={searches}
                            totalCount={searches.length}
                            emptyMessage="No saved searches."
                            sortOptions={bookmarkSearchSortOptions}
                        >
                            {searches.map((search) => (
                                <BookmarkedSearchCard key={search.id} search={search} />
                            ))}
                        </EntityList>
                    )}
                </TabContent>
            </div>
        </div>
    );
}
