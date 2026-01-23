// src/components/bookmarks/BookmarksClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { LuSearch, LuGraduationCap, LuUniversity, LuBookmarkPlus, LuBookMarked } from "react-icons/lu";
import Tabs, { TabContent, TabItem } from "@/components/ui/Tabs";
import GrantCard from "@/components/grants/GrantCard";
import BookmarkedEntityCard from "@/components/bookmarks/BookmarkedEntityCard";
import BookmarkButton from "@/components/bookmarks/BookmarkButton";
import NoteEditor from "@/components/bookmarks/NoteEditor";
import { Button } from "@/components/ui/Button";
import { updateGrantNote, updateSearchNote } from "@/app/actions/bookmarks";

interface BookmarksClientProps {
    grants: any[];
    recipients: any[];
    institutes: any[];
    searches: any[];
}

export default function BookmarksClient({ grants, recipients, institutes, searches }: BookmarksClientProps) {
    const [activeTab, setActiveTab] = useState("grants");

    const tabItems: TabItem[] = [
        { id: "grants", label: "Grants", icon: LuBookMarked, count: grants.length },
        { id: "recipients", label: "Recipients", icon: LuGraduationCap, count: recipients.length },
        { id: "institutes", label: "Institutes", icon: LuUniversity, count: institutes.length },
        { id: "searches", label: "Searches", icon: LuSearch, count: searches.length },
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
                    {/* Grants Tab */}
                    {activeTab === "grants" && (
                        <div className="space-y-6">
                            {grants.length > 0 ? (
                                grants.map((grant) => (
                                    <div key={grant.grant_id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                        <GrantCard {...grant} isBookmarked={true} />
                                        <div className="px-3 py-2.5 bg-gray-50/50">
                                            <NoteEditor
                                                initialNote={grant.notes}
                                                onSave={(note) => updateGrantNote(grant.grant_id, note)}
                                                placeholder="Add notes about this grant only visible to you..."
                                                label="Grant Notes"
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyTabState
                                    type="Grants"
                                    message="You haven't bookmarked any grants yet."
                                    actionLabel="Explore Grants"
                                    actionLink="/search"
                                />
                            )}
                        </div>
                    )}

                    {/* Recipients Tab */}
                    {activeTab === "recipients" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recipients.length > 0 ? (
                                recipients.map((recipient) => (
                                    <BookmarkedEntityCard
                                        key={recipient.recipient_id}
                                        data={recipient}
                                        type="recipient"
                                    />
                                ))
                            ) : (
                                <EmptyTabState
                                    type="Recipients"
                                    message="No recipients saved."
                                    actionLabel="Find Recipients"
                                    actionLink="/recipients"
                                    className="col-span-full"
                                />
                            )}
                        </div>
                    )}

                    {/* Institutes Tab */}
                    {activeTab === "institutes" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {institutes.length > 0 ? (
                                institutes.map((institute) => (
                                    <BookmarkedEntityCard
                                        key={institute.institute_id}
                                        data={institute}
                                        type="institute"
                                    />
                                ))
                            ) : (
                                <EmptyTabState
                                    type="Institutes"
                                    message="No institutes saved."
                                    actionLabel="Browse Institutes"
                                    actionLink="/institutes"
                                    className="col-span-full"
                                />
                            )}
                        </div>
                    )}

                    {/* Searches Tab */}
                    {activeTab === "searches" && (
                        <div className="space-y-4">
                            {searches.length > 0 ? (
                                searches.map((search) => (
                                    <div key={search.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="font-medium text-lg text-gray-900">
                                                    "{search.search_query}"
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {search.result_count ? `${search.result_count.toLocaleString()} results` : 'Search query'} • {new Date(search.searched_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href={`/search?q=${encodeURIComponent(search.search_query)}`}>
                                                    <Button size="sm" variant="outline"><LuSearch className="w-4 h-4 mr-2" /> Run</Button>
                                                </Link>
                                                <BookmarkButton entityType="search" entityId={search.id} isBookmarked={true} showLabel={false} />
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-gray-100">
                                            <NoteEditor
                                                initialNote={search.notes}
                                                onSave={(note) => updateSearchNote(search.id, note)}
                                                placeholder="Notes about this search query..."
                                                className="bg-transparent"
                                                label="Search History Notes"
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyTabState
                                    type="Searches"
                                    message="No saved searches."
                                    actionLabel="View Search History"
                                    actionLink="/account?tab=history"
                                />
                            )}
                        </div>
                    )}
                </TabContent>
            </div>
        </div>
    );
}

function EmptyTabState({ type, message, actionLabel, actionLink, className }: { type: string, message: string, actionLabel: string, actionLink: string, className?: string }) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 ${className}`}>
            <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                <LuBookmarkPlus className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{type} Collection Empty</h3>
            <p className="text-gray-500 max-w-sm mt-2 mb-6">
                {message}
            </p>
            <Link href={actionLink}>
                <Button>{actionLabel}</Button>
            </Link>
        </div>
    );
}
