// src/components/account/SearchHistoryList.tsx
'use client';

import { useRouter } from 'next/navigation';
import { FiSearch, FiCalendar, FiMapPin, FiUser, FiFilter, FiDollarSign } from 'react-icons/fi';
import { LuLayoutGrid, LuCalendarClock, LuListOrdered } from "react-icons/lu";
import { Card } from '@/components/ui/Card';
import Tag, { Tags } from '@/components/ui/Tag';
import BookmarkButton from '@/components/bookmarks/BookmarkButton';
import Button from '@/components/ui/Button';
import { SortButton } from '@/components/ui/SortButton';
import { Pagination } from '@/components/ui/Pagination';

interface SearchHistoryItem {
    id: number;
    search_query: string;
    filters: any;
    result_count: number;
    searched_at: string;
}

interface SearchHistoryListProps {
    history: SearchHistoryItem[];
    totalCount?: number; // Optional to prevent crash if parent misses it
    currentPage?: number;
}

export default function SearchHistoryList({
    history,
    totalCount = 0, // Default to 0
    currentPage = 1
}: SearchHistoryListProps) {
    const router = useRouter();

    const handleSearchAgain = (item: SearchHistoryItem, filters: Record<string, any>) => {
        const params = new URLSearchParams();

        if (item.search_query && item.search_query !== 'null' && item.search_query.trim() !== '') {
            params.set('grant', item.search_query);
        }

        if (filters.recipient) params.set('recipient', filters.recipient);
        if (filters.institute) params.set('institute', filters.institute);

        if (Array.isArray(filters.agencies)) {
            filters.agencies.forEach(v => params.append('agencies', v));
        }

        if (Array.isArray(filters.countries)) filters.countries.forEach(v => params.append('countries', v));
        if (Array.isArray(filters.provinces)) filters.provinces.forEach(v => params.append('provinces', v));
        if (Array.isArray(filters.cities)) filters.cities.forEach(v => params.append('cities', v));

        const fromDate = filters.dateRange?.from || filters.from;
        const toDate = filters.dateRange?.to || filters.to;

        if (fromDate) params.set('from', new Date(fromDate).toISOString().split('T')[0]);
        if (toDate) params.set('to', new Date(toDate).toISOString().split('T')[0]);

        const minVal = filters.valueRange?.min || filters.min;
        const maxVal = filters.valueRange?.max || filters.max;

        if (minVal !== undefined) params.set('min', minVal.toString());
        if (maxVal !== undefined) params.set('max', maxVal.toString());

        router.push(`/search?${params.toString()}`);
    };

    if ((!history || history.length === 0)) {
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
        <div className="space-y-4">
            {/* Header Control Bar */}
            <Card variant="default" className="flex flex-wrap justify-between items-center rounded-3xl p-2 bg-white backdrop-blur-xs border border-gray-100 gap-4 sm:gap-0">
                <span className="text-xs md:text-sm text-gray-500 px-2 flex-grow text-center sm:text-left">
                    Showing <span className="font-semibold text-gray-900">{history.length}</span> of{' '}
                    <span className="font-semibold text-gray-900">{(totalCount || 0).toLocaleString()}</span>{' '}
                    records
                </span>

                {/* Note: Sort buttons logic removed for brevity but can be re-added if needed */}
            </Card>

            <Card className="rounded-3xl overflow-hidden p-0 border border-gray-200 shadow-sm">
                <div className="divide-y divide-gray-100">
                    {history.map((item) => {
                        const rawFilters = typeof item.filters === 'string'
                            ? JSON.parse(item.filters)
                            : (item.filters || {});

                        const filters: Record<string, any> = {};
                        Object.entries(rawFilters).forEach(([key, value]) => {
                            if (value && value !== 'null' && value !== '') {
                                filters[key] = value;
                            }
                        });

                        const dateFrom = filters.dateRange?.from || filters.from;
                        const dateTo = filters.dateRange?.to || filters.to;
                        let dateRangeText = null;
                        if (dateFrom && dateTo) {
                            const start = new Date(dateFrom).getFullYear();
                            const end = new Date(dateTo).getFullYear();
                            if (start !== 2010 || end !== 2030) {
                                dateRangeText = `${start} - ${end}`;
                            }
                        }

                        const valMin = filters.valueRange?.min;
                        const valMax = filters.valueRange?.max;
                        let valueRangeText = null;
                        if ((valMin !== undefined && valMin > 0) || (valMax !== undefined && valMax < 200_000_000)) {
                            valueRangeText = `$${(valMin || 0).toLocaleString()} - $${(valMax || 'Max').toLocaleString()}`;
                        }

                        const hasGrantQuery = item.search_query && item.search_query !== 'null' && item.search_query !== '';

                        return (
                            <div key={item.id} className="group p-5 hover:bg-gray-50/80 transition-all duration-200 flex flex-col md:flex-row gap-5 md:items-center justify-between">
                                <div className="flex flex-col gap-3 flex-1 min-w-0">
                                    <Tags spacing="tight" className="items-center flex-wrap">
                                        {hasGrantQuery && (
                                            <Tag text="Grant Title" innerText={item.search_query} variant="primary" icon={FiSearch} size="sm" />
                                        )}
                                        {filters.recipient && (
                                            <Tag text="Recipient" innerText={filters.recipient} variant="secondary" icon={FiUser} size="sm" />
                                        )}
                                        {filters.institute && (
                                            <Tag text="Institute" innerText={filters.institute} variant="secondary" icon={FiMapPin} size="sm" />
                                        )}
                                        {filters.agencies && filters.agencies.length > 0 && (
                                            <Tag text="Agencies" innerText={filters.agencies.join(', ')} variant="default" icon={FiFilter} size="sm" />
                                        )}
                                        {(filters.countries?.length > 0 || filters.provinces?.length > 0) && (
                                            <Tag text="Location" innerText={[...filters.countries || [], ...filters.provinces || []].join(', ')} variant="default" icon={FiMapPin} size="sm" />
                                        )}
                                        {dateRangeText && (
                                            <Tag text="Fiscal Year" innerText={dateRangeText} variant="warning" icon={FiCalendar} size="sm" />
                                        )}
                                        {valueRangeText && (
                                            <Tag text="Value" innerText={valueRangeText} variant="warning" icon={FiDollarSign} size="sm" />
                                        )}
                                    </Tags>

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

                                <div className="flex items-center gap-2 md:border-l md:border-gray-100 md:pl-5 md:ml-2">
                                    <BookmarkButton
                                        variant="secondary"
                                        entityId={item.id}
                                        entityType="search"
                                        isBookmarked={false}
                                    />
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleSearchAgain(item, filters)}
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

            <Pagination
                totalPages={Math.ceil(totalCount / 15)}
                currentPage={currentPage}
                paramName="history_page"
            />
        </div>
    );
}
