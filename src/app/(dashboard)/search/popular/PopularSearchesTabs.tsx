// src/app/(dashboard)/search/popular/PopularSearchesTabs.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LuUser, LuUniversity, LuFileText } from 'react-icons/lu';
import Tabs, { TabContent, TabItem } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import EmptyState from '@/components/ui/EmptyState';
import { SearchCategory, PopularSearch } from '@/types/search';

interface PopularSearchesTabsProps {
    dataByCategory: Record<SearchCategory, PopularSearch[]>;
}

const TABS: TabItem[] = [
    { id: 'recipient', label: 'Recipients', icon: LuUser },
    { id: 'institute', label: 'Institutes', icon: LuUniversity },
    { id: 'grant', label: 'Grants', icon: LuFileText },
];

export default function PopularSearchesTabs({ dataByCategory }: PopularSearchesTabsProps) {
    const [activeCategory, setActiveCategory] = useState<SearchCategory>('recipient');
    const items = dataByCategory[activeCategory];

    return (
        <div className="space-y-4">
            <Tabs
                tabs={TABS}
                activeTab={activeCategory}
                onChange={(id) => setActiveCategory(id as SearchCategory)}
                variant="pills"
                size="md"
                fullWidth
            />

            <Card>
                <Card.Content noPadding>
                    <TabContent activeTab={activeCategory}>
                        {items.length > 0 ? (
                            <div className="space-y-1 p-2">
                                {items.map((item, index) => (
                                    <Link
                                        key={item.text}
                                        href={`/search?${activeCategory}=${encodeURIComponent(item.text)}`}
                                        className="w-full group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm text-gray-700 font-medium truncate group-hover:text-blue-700 transition-colors">
                                                {item.text}
                                            </span>
                                        </div>
                                        <Tag
                                            variant="secondary"
                                            size="sm"
                                            className="text-[10px] px-1.5 h-5 text-gray-400 font-normal bg-transparent border border-gray-100 flex-shrink-0"
                                            text={String(item.count)}
                                        />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="No trends yet"
                                message="Start searching to see what's popular!"
                                size="sm"
                            />
                        )}
                    </TabContent>
                </Card.Content>
            </Card>
        </div>
    );
}
