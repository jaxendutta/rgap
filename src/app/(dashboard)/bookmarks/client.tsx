// src/app/(dashboard)/bookmarks/client.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
    LuSearch, LuGraduationCap, LuUniversity, LuBookMarked, LuHash,
    LuCalendarDays, LuScrollText, LuFilter, LuDollarSign, LuMapPin,
} from "react-icons/lu";
import { MdOutlineAccountBalance, MdSortByAlpha } from 'react-icons/md';
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
import Tag, { Tags } from '@/components/ui/Tag';

// Helper to parse search filters for display
const SearchTags = ({ item }: { item: any }) => {
    const rawFilters = typeof item.filters === 'string'
        ? JSON.parse(item.filters)
        : (item.filters || {});

    const filters: any = {};
    Object.entries(rawFilters).forEach(([key, value]) => {
        if (value && value !== 'null' && value !== '') {
            filters[key] = value;
        }
    });

    const dateFrom = filters.dateRange?.from || filters.from;
    const dateTo = filters.dateRange?.to || filters.to;
    let dateRangeText = null;

    if (dateFrom && dateTo) {
        const dFrom = new Date(dateFrom);
        const dTo = new Date(dateTo);
        dateRangeText = `${dFrom.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })} - ${dTo.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`;
    }

    const valMin = filters.valueRange?.min;
    const valMax = filters.valueRange?.max;
    let valueRangeText = null;
    if ((valMin !== undefined && valMin > 0) || (valMax !== undefined && valMax < 200_000_000)) {
        valueRangeText = `$${(valMin || 0).toLocaleString()} - $${(valMax || 'Max').toLocaleString()}`;
    }

    return (
        <Tags spacing="tight" className="items-center flex-wrap">
            {filters.recipient && (
                <Tag text="Recipient" innerText={filters.recipient} variant="primary" icon={LuGraduationCap} size="sm" />
            )}
            {filters.institute && (
                <Tag text="Institute" innerText={filters.institute} variant="danger" icon={MdOutlineAccountBalance} size="sm" />
            )}
            {item.search_query && item.search_query !== 'null' && (
                <Tag text="Grant Title" innerText={item.search_query} variant="warning" icon={LuScrollText} size="sm" />
            )}
            {filters.agencies?.length > 0 && (
                <Tag text="Agencies" innerText={filters.agencies.join(' | ')} variant="secondary" icon={LuFilter} size="sm" />
            )}
            {dateRangeText && (
                <Tag text="Dates" innerText={dateRangeText} variant="secondary" icon={LuCalendarDays} size="sm" />
            )}
            {valueRangeText && (
                <Tag text="Values" innerText={valueRangeText} variant="secondary" icon={LuDollarSign} size="sm" />
            )}
            {(filters.countries?.length > 0 || filters.provinces?.length > 0) && (
                <Tag text="Location" innerText={[...(filters.countries || []), ...(filters.provinces || [])].join(' | ')} variant="secondary" icon={LuMapPin} size="sm" />
            )}
        </Tags>
    );
};

// NEW: Search Card Component matching SearchHistoryItem style
const BookmarkedSearchCard = ({ search }: { search: any }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 md:p-5 flex flex-col gap-4 flex-1">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <LuCalendarDays className="size-3" />
                            <span>Searched {new Date(search.searched_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className={search.result_count > 0 ? "text-green-600 font-medium" : "text-gray-400"}>
                                {search.result_count?.toLocaleString() || 0} results
                            </span>
                        </div>
                        <SearchTags item={search} />
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                        <BookmarkButton
                            entityType="search"
                            entityId={search.id}
                            isBookmarked={true}
                            hasNote={!!search.notes}
                            showLabel={false}
                            className="self-end"
                        />
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium">
                        Saved {new Date(search.bookmarked_at).toLocaleDateString()}
                    </div>
                    <Link href={`/search?q=${encodeURIComponent(search.search_query || '')}&re-run=true`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                            <LuSearch className="w-3.5 h-3.5 mr-1.5" />
                            Run Search
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100">
                <NoteEditor
                    initialNote={search.notes}
                    onSave={(note) => updateSearchNote(search.id, note)}
                    placeholder="Notes about this search query..."
                    label="Personal Notes"
                />
            </div>
        </div>
    );
};

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
                                <div key={grant.grant_id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4 flex flex-col h-full">
                                    <div className="flex-1">
                                        <GrantCard {...grant} isBookmarked={true} />
                                    </div>
                                    <div className="px-3 py-2.5 bg-gray-50/50 border-t border-gray-100 mt-auto">
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

                    {/* Searches Tab */}
                    {activeTab === "searches" && (
                        <EntityList
                            entityType="search"
                            entities={searches}
                            totalCount={searches.length}
                            emptyMessage="No saved searches."
                            sortOptions={searchBookmarkSortOptions}
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
