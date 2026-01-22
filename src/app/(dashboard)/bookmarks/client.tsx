// src/app/(dashboard)/bookmarks/client.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { LuSearch, LuFileText, LuGraduationCap, LuUniversity } from "react-icons/lu";
import Tabs, { TabContent, TabItem } from "@/components/ui/Tabs";
import GrantCard from "@/components/grants/GrantCard";
import EntityCard from "@/components/entity/EntityCard";
import BookmarkButton from "@/components/bookmarks/BookmarkButton";
import { Button } from "@/components/ui/Button";

interface BookmarksClientProps {
    grants: any[];
    recipients: any[];
    institutes: any[];
    searches: any[];
}

export default function BookmarksClient({ grants, recipients, institutes, searches }: BookmarksClientProps) {
    const [activeTab, setActiveTab] = useState("grants");

    const tabItems: TabItem[] = [
        { id: "grants", label: "Grants", icon: LuFileText, count: grants.length },
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
                variant="underline"
                className="mb-6"
                showCounts={true}
            />

            <TabContent activeTab={activeTab}>
                {/* Grants Tab */}
                {activeTab === "grants" && (
                    <div className="space-y-4">
                        {grants.length > 0 ? (
                            grants.map((grant) => (
                                <GrantCard
                                    key={grant.grant_id}
                                    {...grant}
                                    isBookmarked={true}
                                />
                            ))
                        ) : <EmptyTabState type="Grants" />}
                    </div>
                )}

                {/* Recipients Tab */}
                {activeTab === "recipients" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recipients.length > 0 ? (
                            recipients.map((recipient) => (
                                <EntityCard
                                    key={recipient.recipient_id}
                                    entityType="recipient"
                                    entity={{ ...recipient, is_bookmarked: true }}
                                />
                            ))
                        ) : <EmptyTabState type="Recipients" />}
                    </div>
                )}

                {/* Institutes Tab */}
                {activeTab === "institutes" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {institutes.length > 0 ? (
                            institutes.map((institute) => (
                                <EntityCard
                                    key={institute.institute_id}
                                    entityType="institute"
                                    entity={{ ...institute, is_bookmarked: true }}
                                />
                            ))
                        ) : <EmptyTabState type="Institutes" />}
                    </div>
                )}

                {/* Searches Tab */}
                {activeTab === "searches" && (
                    <div className="space-y-4">
                        {searches.length > 0 ? (
                            searches.map((search) => (
                                <div key={search.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            "{search.search_query}"
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {search.result_count ? `${search.result_count} results` : 'Search query'} • {new Date(search.searched_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/search?q=${encodeURIComponent(search.search_query)}`}>
                                            <Button size="sm" variant="outline"><LuSearch className="w-4 h-4 mr-2" /> Run</Button>
                                        </Link>
                                        <BookmarkButton entityType="search" entityId={search.id} isBookmarked={true} showLabel={false} />
                                    </div>
                                </div>
                            ))
                        ) : <EmptyTabState type="Searches" />}
                    </div>
                )}
            </TabContent>
        </div>
    );
}

function EmptyTabState({ type }: { type: string }) {
    return (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <p className="text-gray-500">No saved {type.toLowerCase()} found.</p>
        </div>
    );
}
