// src/app/(dashboard)/search/popular/page.tsx
import Link from 'next/link';
import { Metadata } from 'next';
import { LuTrendingUp, LuArrowLeft, LuLock } from 'react-icons/lu';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { getCurrentUser } from '@/lib/session';
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
    const user = await getCurrentUser();

    if (!user) {
        return (
            // Grow to center within the available space (like the login card),
            // rather than forcing min-h-screen inside the already-full-height
            // MainLayout, which overflowed past the viewport.
            <div className="w-full h-full flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl p-8 md:p-10 text-center ring-1 ring-gray-900/5">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 text-white mb-6 shadow-lg">
                        <LuLock className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-3">
                        Sign in to view popular searches
                    </h2>
                    <p className="text-gray-500 mb-8">
                        See the most frequently searched recipients, institutes, and grants across RGAP.
                    </p>
                    <Link href="/login" className="block w-full">
                        <Button size="lg" className="w-full shadow-md hover:shadow-lg transition-all">
                            Sign In to RGAP
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

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
