// src/app/(dashboard)/search/popular/page.tsx
import Link from 'next/link';
import { Metadata } from 'next';
import { LuUser, LuUniversity, LuFileText, LuTrendingUp, LuArrowLeft } from 'react-icons/lu';
import { IconType } from 'react-icons';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import EmptyState from '@/components/ui/EmptyState';
import { getPopularSearches } from '@/app/actions/analytics';
import { SearchCategory, PopularSearch } from '@/types/search';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Popular Searches | RGAP',
    description: 'The most frequently searched recipients, institutes, and grants on RGAP',
};

const CATEGORIES: { id: SearchCategory; label: string; icon: IconType }[] = [
    { id: 'recipient', label: 'Recipients', icon: LuUser },
    { id: 'institute', label: 'Institutes', icon: LuUniversity },
    { id: 'grant', label: 'Grants', icon: LuFileText },
];

const RESULTS_PER_CATEGORY = 25;

function CategorySection({ category, label, icon: Icon, items }: {
    category: SearchCategory;
    label: string;
    icon: IconType;
    items: PopularSearch[];
}) {
    return (
        <Card>
            <Card.Header icon={Icon} title={label} />
            <Card.Content noPadding>
                {items.length > 0 ? (
                    <div className="p-2 space-y-1">
                        {items.map((item, index) => (
                            <Link
                                key={item.text}
                                href={`/search?${category}=${encodeURIComponent(item.text)}`}
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
            </Card.Content>
        </Card>
    );
}

export default async function PopularSearchesPage() {
    const [recipients, institutes, grants] = await Promise.all([
        getPopularSearches('recipient', RESULTS_PER_CATEGORY),
        getPopularSearches('institute', RESULTS_PER_CATEGORY),
        getPopularSearches('grant', RESULTS_PER_CATEGORY),
    ]);

    const dataByCategory: Record<SearchCategory, PopularSearch[]> = {
        recipient: recipients,
        institute: institutes,
        grant: grants,
    };

    return (
        <PageContainer>
            <PageHeader
                title="Popular Searches"
                subtitle="The most frequently searched recipients, institutes, and grants across RGAP"
                icon={LuTrendingUp}
                breadcrumbs={
                    <Link
                        href="/search"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <LuArrowLeft className="w-3.5 h-3.5" />
                        Back to Search
                    </Link>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {CATEGORIES.map(({ id, label, icon }) => (
                    <CategorySection
                        key={id}
                        category={id}
                        label={label}
                        icon={icon}
                        items={dataByCategory[id]}
                    />
                ))}
            </div>
        </PageContainer>
    );
}
