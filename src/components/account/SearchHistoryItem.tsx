'use client';

import { FiSearch, FiCalendar, FiMapPin, FiUser, FiFilter, FiDollarSign } from 'react-icons/fi';
import { LuScrollText } from "react-icons/lu";
import Tag, { Tags } from '@/components/ui/Tag';
import BookmarkButton from '@/components/bookmarks/BookmarkButton';
import Button from '@/components/ui/Button';
import { MdOutlineAccountBalance } from 'react-icons/md';
import { SearchHistoryItem as SearchHistoryItemData } from '@/types/search';

interface SearchHistoryItemProps {
    item: SearchHistoryItemData;
    onSearchAgain: (item: SearchHistoryItemData, filters: SearchHistoryItemData['filters']) => void;
}

export default function SearchHistoryItem({ item, onSearchAgain }: SearchHistoryItemProps) {
    const rawFilters = typeof item.filters === 'string'
        ? JSON.parse(item.filters)
        : (item.filters || {});

    const filters: SearchHistoryItemData['filters'] = {};
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
        <div key={item.id} className="group p-3 md:p-5 hover:bg-gray-50/80 transition-all duration-200 flex flex-row gap-0 md:gap-5 md:items-center justify-between">
            <div className="flex flex-col gap-2 md:gap-3 flex-1 min-w-0 justify-center">
                <Tags spacing="tight" className="items-center flex-wrap">
                    {filters.recipient && (
                        <Tag text="Recipient" innerText={filters.recipient} variant="primary" icon={FiUser} size="sm" />
                    )}
                    {filters.institute && (
                        <Tag text="Institute" innerText={filters.institute} variant="danger" icon={MdOutlineAccountBalance} size="sm" />
                    )}
                    {item.search_query && item.search_query !== 'null' && (
                        <Tag text="Grant Title" innerText={item.search_query} variant="warning" icon={LuScrollText} size="sm" />
                    )}
                    {filters.agencies?.length > 0 && (
                        <Tag text="Agencies" innerText={filters.agencies.join(' | ')} variant="secondary" icon={FiFilter} size="sm" />
                    )}
                    {dateRangeText && (
                        <Tag text="Dates" innerText={dateRangeText} variant="secondary" icon={FiCalendar} size="sm" />
                    )}
                    {valueRangeText && (
                        <Tag text="Values" innerText={valueRangeText} variant="secondary" icon={FiDollarSign} size="sm" />
                    )}
                    {filters.countries?.length > 0 && (
                        <Tag text="Countries" innerText={filters.countries.join(' | ')} variant="secondary" icon={FiMapPin} size="sm" />
                    )}
                    {filters.provinces?.length > 0 && (
                        <Tag text="Provinces" innerText={filters.provinces.join(' | ')} variant="secondary" icon={FiMapPin} size="sm" />
                    )}
                    {filters.cities?.length > 0 && (
                        <Tag text="Cities" innerText={filters.cities.join(' | ')} variant="secondary" icon={FiMapPin} size="sm" />
                    )}
                </Tags>

                <div className="flex items-center gap-2 text-xs text-gray-400 pl-1">
                    <span>
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

            <div className="flex flex-col md:flex-row items-center justify-start gap-2 md:pl-5 md:ml-2">
                <BookmarkButton
                    variant="secondary"
                    entityId={item.id}
                    entityType="search"
                    isBookmarked={false}
                    className="p-2 flex flex-1"
                />
                <Button variant="secondary" onClick={() => onSearchAgain(item, filters)} className="p-2 flex-1">
                    <FiSearch className="size-4" />
                    <span className="hidden md:inline-flex whitespace-nowrap">Search Again</span>
                </Button>
            </div>
        </div>
    );
}
