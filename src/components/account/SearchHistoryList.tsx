// src/components/account/SearchHistoryList.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LuCalendarClock, LuHash, LuLayoutGrid } from "react-icons/lu";
import { Card } from '@/components/ui/Card';
import { SortButton } from '@/components/ui/SortButton';
import { Pagination } from '@/components/ui/Pagination';
import { SearchHistoryItem as SearchHistoryItemData } from '@/types/search';
import SearchHistoryItem from './SearchHistoryItem';

interface SearchHistoryListProps {
    history: SearchHistoryItemData[];
    totalCount?: number;
    currentPage?: number;
    onImportHistory: (history: SearchHistoryItemData[]) => void;
}

export default function SearchHistoryList({
    history,
    totalCount = 0,
    currentPage = 1,
    onImportHistory
}: SearchHistoryListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Defaults
    const currentSort = searchParams.get('history_sort') || 'searched_at';
    const currentDir = (searchParams.get('history_dir') as 'asc' | 'desc') || 'desc';

    const handleSort = (field: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (field === currentSort) {
            params.set('history_dir', currentDir === 'desc' ? 'asc' : 'desc');
        } else {
            params.set('history_sort', field);
            params.set('history_dir', 'desc');
        }
        params.set('history_page', '1');
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleSearchAgain = (item: SearchHistoryItemData, filters: SearchHistoryItemData['filters']) => {
        const params = new URLSearchParams();
        if (item.search_query?.trim()) params.set('grant', item.search_query);
        if (filters.recipient) params.set('recipient', filters.recipient);
        if (filters.institute) params.set('institute', filters.institute);
        if (Array.isArray(filters.agencies)) filters.agencies.forEach(v => params.append('agencies', v));
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
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card variant="default" className="flex flex-wrap justify-between items-center rounded-3xl p-1.5 md:p-2 bg-white backdrop-blur-xs border border-gray-100 gap-4 sm:gap-0">
                <span className="text-xs md:text-sm text-gray-500 px-2 md:px-4 flex-grow">
                    Showing <span className="font-semibold text-gray-900">{history.length}</span> of{' '}
                    <span className="font-semibold text-gray-900">{(totalCount || 0).toLocaleString()}</span>{' '}
                    records
                </span>

                <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
                    <SortButton
                        label="Date"
                        icon={LuCalendarClock}
                        field="searched_at"
                        currentField={currentSort}
                        direction={currentDir}
                        onClick={() => handleSort('searched_at')}
                    />
                    <SortButton
                        label="Results"
                        icon={LuHash}
                        field="result_count"
                        currentField={currentSort}
                        direction={currentDir}
                        onClick={() => handleSort('result_count')}
                    />
                </div>
            </Card>

            <Card className="rounded-3xl overflow-hidden p-0 border border-gray-200 shadow-sm">
                <div className="divide-y divide-gray-100">
                    {history.map((item) => (
                        <SearchHistoryItem key={item.id} item={item} onSearchAgain={handleSearchAgain} />
                    ))}
                </div>
            </Card>

            <Pagination
                totalCount={totalCount}
                currentPage={currentPage}
                paramName="history_page"
            />
        </div>
    );
}
