'use client';

import { Card } from '@/components/ui/Card';
import Tag from '../ui/Tag';
import { TbClockSearch } from 'react-icons/tb';

interface SearchHistoryItem {
    id: number;
    search_query: string;
    filters: any;
    result_count: number;
    searched_at: string;
}

export default function SearchHistoryList({ history }: { history: SearchHistoryItem[] }) {
    if (!history || history.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <TbClockSearch className="mx-auto mb-4 size-10 opacity-20" />
                No search history recorded yet.
            </div>
        );
    }

    return (
        <Card className="rounded-3xl overflow-hidden p-0 border border-gray-200">
            <div className="w-full divide-y divide-gray-100">
                {history.map((item) => {
                    const filters = typeof item.filters === 'string' ? JSON.parse(item.filters) : item.filters;

                    return (
                        <div key={item.id} className="p-4 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row gap-4 md:items-center justify-between">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-full flex-shrink-0">
                                    <TbClockSearch className="size-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 line-clamp-1">
                                        {item.search_query || <span className="text-gray-400 italic">No keywords</span>}
                                    </p>
                                    <p className="text-xs text-gray-500">{item.result_count} results</p>
                                </div>
                            </div>

                            {(filters?.recipient || filters?.institute) && (
                                <div className="flex flex-wrap gap-2">
                                    {filters.recipient && <Tag text={filters.recipient} variant="outline" size="sm" />}
                                    {filters.institute && <Tag text={filters.institute} variant="outline" size="sm" />}
                                </div>
                            )}

                            <div className="text-xs text-gray-400 whitespace-nowrap">
                                {new Date(item.searched_at).toLocaleDateString()}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
