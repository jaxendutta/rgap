// src/app/(dashboard)/search/popular/page.tsx
import Link from 'next/link';
import { Metadata } from 'next';
import { LuTrendingUp, LuArrowLeft } from 'react-icons/lu';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { getPopularSearches } from '@/app/actions/analytics';
import { SearchCategory, PopularSearch } from '@/types/search';
import PopularSearchesTabs from './PopularSearchesTabs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Popular Searches | RGAP',
    description: 'The most frequently searched recipients, institutes, and grants on RGAP',
};

const RESULTS_PER_CATEGORY = 25;

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

            <PopularSearchesTabs dataByCategory={dataByCategory} />
        </PageContainer>
    );
}
