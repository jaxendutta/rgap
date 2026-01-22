// src/app/(dashboard)/search/client.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import SearchInterface from '@/components/search/SearchInterface';
import EntityList from '@/components/entity/EntityList';
import { GrantCard } from '@/components/grants/GrantCard';
import EmptyState from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { LuSearch, LuGraduationCap, LuUniversity, LuBookMarked } from 'react-icons/lu';
import type { GrantWithDetails } from '@/types/database';
import { DEFAULT_FILTER_STATE } from '@/constants/filters';
import { saveSearchHistory } from '@/app/actions/history';
import { getSortOptions } from '@/lib/utils';

interface FilterOptions {
    agencies: string[];
    countries: string[];
    provinces: string[];
    cities: string[];
}

interface SearchPageClientProps {
    filterOptions: FilterOptions;
    initialSearchTerms?: Record<string, string>;
    initialFilters?: typeof DEFAULT_FILTER_STATE;
}

export default function SearchPageClient({
    filterOptions,
    initialSearchTerms = {},
    initialFilters = DEFAULT_FILTER_STATE
}: SearchPageClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [grants, setGrants] = useState<GrantWithDetails[]>([]);
    const [visualizationData, setVisualizationData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [totalResults, setTotalResults] = useState(0);

    const currentPage = Number(searchParams.get('page')) || 1;
    const itemsPerPage = 20;
    const totalPages = Math.ceil(totalResults / itemsPerPage);

    // Effect triggers when URL string changes
    useEffect(() => {
        const currentParams = {
            searchTerms: {
                recipient: searchParams.get('recipient') || initialSearchTerms.recipient || '',
                institute: searchParams.get('institute') || initialSearchTerms.institute || '',
                grant: searchParams.get('grant') || initialSearchTerms.grant || '',
            },
            filters: {
                ...DEFAULT_FILTER_STATE,
                agencies: searchParams.getAll('agencies').length > 0 ? searchParams.getAll('agencies') : initialFilters.agencies,
                countries: searchParams.getAll('countries').length > 0 ? searchParams.getAll('countries') : initialFilters.countries,
                provinces: searchParams.getAll('provinces').length > 0 ? searchParams.getAll('provinces') : initialFilters.provinces,
                cities: searchParams.getAll('cities').length > 0 ? searchParams.getAll('cities') : initialFilters.cities,
                dateRange: {
                    from: searchParams.get('from') ? new Date(searchParams.get('from')!) : initialFilters.dateRange.from,
                    to: searchParams.get('to') ? new Date(searchParams.get('to')!) : initialFilters.dateRange.to,
                },
                valueRange: {
                    min: searchParams.get('min') ? Number(searchParams.get('min')) : initialFilters.valueRange.min,
                    max: searchParams.get('max') ? Number(searchParams.get('max')) : initialFilters.valueRange.max,
                }
            },
            sortConfig: {
                field: searchParams.get('sort') || 'agreement_start_date',
                direction: searchParams.get('dir') || 'desc'
            },
            pagination: {
                page: currentPage,
                limit: itemsPerPage
            }
        };

        const hasTerms = Object.values(currentParams.searchTerms).some(t => t);
        const hasFilters = currentParams.filters.agencies.length > 0 || currentParams.filters.countries.length > 0;

        if (hasTerms || hasFilters || hasSearched) {
            fetchData(currentParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.toString()]);

    const fetchData = async (params: any) => {
        setIsLoading(true);
        setHasSearched(true);

        try {
            const [listResponse, visResponse] = await Promise.all([
                fetch('/api/grants', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...params, format: 'full' }),
                }),
                fetch('/api/grants', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...params, format: 'visualization' }),
                })
            ]);

            if (!listResponse.ok || !visResponse.ok) throw new Error('Search failed');

            const listData = await listResponse.json();
            const visData = await visResponse.json();

            // 1. DEFINE count here
            const count = listData.pagination?.total || 0;

            setGrants(listData.data || []);
            setTotalResults(count);
            setVisualizationData(visData.data || []);

            // 2. USE count here
            if (params.pagination.page === 1) {
                saveSearchHistory(
                    params.searchTerms,
                    params.filters,
                    count
                );
            }

        } catch (error) {
            console.error('Search error:', error);
            setGrants([]);
            setTotalResults(0);
            setVisualizationData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchUpdate = (params: any) => {
        const urlParams = new URLSearchParams(searchParams.toString());

        Object.entries(params.searchTerms).forEach(([key, value]) => {
            if (value) urlParams.set(key, value as string);
            else urlParams.delete(key);
        });

        ['agencies', 'countries', 'provinces', 'cities'].forEach(key => {
            urlParams.delete(key);
            // @ts-ignore
            params.filters[key]?.forEach(v => urlParams.append(key, v));
        });

        const { dateRange, valueRange } = params.filters;
        if (dateRange?.from && dateRange.from.toISOString() !== DEFAULT_FILTER_STATE.dateRange.from.toISOString()) {
            urlParams.set('from', dateRange.from.toISOString().split('T')[0]);
        } else urlParams.delete('from');

        if (dateRange?.to && dateRange.to.toISOString() !== DEFAULT_FILTER_STATE.dateRange.to.toISOString()) {
            urlParams.set('to', dateRange.to.toISOString().split('T')[0]);
        } else urlParams.delete('to');

        if (valueRange?.min !== undefined && valueRange.min !== DEFAULT_FILTER_STATE.valueRange.min) {
            urlParams.set('min', valueRange.min.toString());
        } else urlParams.delete('min');

        if (valueRange?.max !== undefined && valueRange.max !== DEFAULT_FILTER_STATE.valueRange.max) {
            urlParams.set('max', valueRange.max.toString());
        } else urlParams.delete('max');

        urlParams.set('page', '1');

        urlParams.sort();
        const currentSorted = new URLSearchParams(searchParams.toString());
        currentSorted.sort();
        if (urlParams.toString() === currentSorted.toString()) return;

        router.replace(`${pathname}?${urlParams.toString()}`, { scroll: false });
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <PageContainer>
            <PageHeader
                title="Advanced Search"
                subtitle="Search for grants across NSERC, CIHR, and SSHRC funding agencies"
            />

            <SearchInterface
                fields={[
                    { key: 'recipient', icon: LuGraduationCap, placeholder: 'Search by recipient name...' },
                    { key: 'institute', icon: LuUniversity, placeholder: 'Search by institute name...' },
                    { key: 'grant', icon: LuBookMarked, placeholder: 'Search by grant title...' },
                ]}
                filterOptions={filterOptions}
                initialValues={initialSearchTerms}
                initialFilters={initialFilters}
                onSearch={handleSearchUpdate}
                showPopularSearches={true}
            />

            <div className="md:mt-8 space-y-6">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                ) : !hasSearched ? (
                    <EmptyState
                        icon={LuSearch}
                        title="Start Your Search"
                        message="Enter search terms or use filters to find grants"
                    />
                ) : (
                    <>
                        <EntityList
                            entityType="grant"
                            entities={grants}
                            totalCount={totalResults}
                            sortOptions={getSortOptions('grant', 'grant')}
                            showVisualization={true}
                            visualizationData={visualizationData}
                            emptyMessage="Try adjusting your search terms or filters"
                            viewContext="search"
                        >
                            {grants.map((grant) => (
                                <GrantCard key={grant.grant_id} {...grant} />
                            ))}
                        </EntityList>

                        {totalPages > 1 && (
                            <Pagination
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}
            </div>
        </PageContainer>
    );
}
