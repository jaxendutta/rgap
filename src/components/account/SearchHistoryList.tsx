'use client';

import { useRouter } from 'next/navigation';
import { FiSearch, FiCalendar, FiHash, FiMapPin, FiUser } from 'react-icons/fi';
import { LuLayoutGrid } from "react-icons/lu";
import { Card } from '@/components/ui/Card';
import Tag, { Tags } from '@/components/ui/Tag';
import BookmarkButton from '@/components/bookmarks/BookmarkButton';
import Button from '@/components/ui/Button';

interface SearchHistoryItem {
    id: number;
    search_query: string;
    filters: any;
    result_count: number;
    searched_at: string;
}

export default function SearchHistoryList({ history }: { history: SearchHistoryItem[] }) {
    const router = useRouter();

    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                    <LuLayoutGrid className="size-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-medium">No search history yet</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">
                    Start searching for grants, recipients, or institutes to build your history.
                </p>
            </div>
        );
    }

    return (
        <Card className="rounded-3xl overflow-hidden p-0 border border-gray-200 shadow-sm">
            <div className="divide-y divide-gray-100">
                {history.map((item) => {
                    // 1. Safe JSON Parsing
                    const rawFilters = typeof item.filters === 'string'
                        ? JSON.parse(item.filters)
                        : (item.filters || {});

                    // 2. CLEAN THE FILTERS (Fixes the "null" issue)
                    const filters: Record<string, any> = {};
                    Object.entries(rawFilters).forEach(([key, value]) => {
                        // Only keep valid values (exclude null, "null", undefined, empty string)
                        if (value && value !== 'null' && value !== '') {
                            filters[key] = value;
                        }
                    });

                    // 3. Format Date Range
                    let dateRangeText = null;
                    if (filters.from_year && filters.to_year) {
                        dateRangeText = `${filters.from_year} - ${filters.to_year}`;
                    } else if (filters.from_year) {
                        dateRangeText = `Since ${filters.from_year}`;
                    } else if (filters.to_year) {
                        dateRangeText = `Until ${filters.to_year}`;
                    }

                    // 4. Construct Search URL (using CLEAN filters)
                    const searchParams = new URLSearchParams();
                    if (item.search_query && item.search_query !== 'null') {
                        searchParams.set('q', item.search_query);
                    }
                    Object.entries(filters).forEach(([k, v]) => searchParams.set(k, String(v)));
                    const searchUrl = `/search?${searchParams.toString()}`;

                    const hasFilters = Object.keys(filters).length > 0;
                    const hasQuery = item.search_query && item.search_query !== 'null';

                    return (
                        <div key={item.id} className="group p-5 hover:bg-gray-50/80 transition-all duration-200 flex flex-col md:flex-row gap-5 md:items-center justify-between">

                            {/* LEFT: Search Context */}
                            <div className="flex flex-col gap-3 flex-1 min-w-0">

                                {/* Tag Group */}
                                <Tags spacing="tight" className="items-center">

                                    {/* A. Search Query */}
                                    {hasQuery ? (
                                        <Tag
                                            text="Keywords"
                                            innerText={item.search_query}
                                            variant="primary"
                                            icon={FiSearch}
                                            size="sm"
                                        />
                                    ) : (
                                        // "All Grants" if no query AND no filters
                                        !hasFilters && (
                                            <Tag text="All Grants" variant="default" size="sm" />
                                        )
                                    )}

                                    {/* B. Specific Filters (Secondary/Gray) */}
                                    {filters.recipient && (
                                        <Tag
                                            text="Recipient"
                                            innerText={filters.recipient}
                                            variant="secondary"
                                            icon={FiUser}
                                            size="sm"
                                        />
                                    )}
                                    {filters.institute && (
                                        <Tag
                                            text="Institute"
                                            innerText={filters.institute}
                                            variant="secondary"
                                            icon={FiMapPin}
                                            size="sm"
                                        />
                                    )}
                                    {filters.program && (
                                        <Tag
                                            text="Program"
                                            innerText={filters.program}
                                            variant="secondary"
                                            icon={FiHash}
                                            size="sm"
                                        />
                                    )}

                                    {/* C. Date Range (Warning/Amber) */}
                                    {dateRangeText && (
                                        <Tag
                                            text="Fiscal Year"
                                            innerText={dateRangeText}
                                            variant="warning"
                                            icon={FiCalendar}
                                            size="sm"
                                        />
                                    )}
                                </Tags>

                                {/* Metadata Row */}
                                <div className="flex items-center gap-2 text-xs text-gray-400 pl-1">
                                    <span suppressHydrationWarning>
                                        {new Date(item.searched_at).toLocaleDateString(undefined, {
                                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                        })}
                                    </span>
                                    <span>•</span>
                                    <span className={item.result_count > 0 ? "text-green-600 font-medium" : "text-gray-400"}>
                                        {item.result_count.toLocaleString()} results found
                                    </span>
                                </div>
                            </div>

                            {/* RIGHT: Actions */}
                            <div className="flex items-center gap-2 md:border-l md:border-gray-100 md:pl-5 md:ml-2">
                                {/* Bookmark Search Config */}
                                <BookmarkButton
                                    variant="secondary"
                                    entityId={item.id}
                                    entityType="search"
                                    isBookmarked={false}
                                />

                                {/* Re-Run Search Button */}
                                <Button
                                    variant="secondary"
                                    onClick={() => router.push(searchUrl)}
                                    className="p-1 md:p-2"
                                >
                                    <FiSearch className="size-4" />
                                    <span className="hidden md:inline-flex">Search Again</span>
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
