// src/app/(dashboard)/search/SearchPageClient.tsx
// Client Component - Handles interactive search UI

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import SearchInterface from '@/components/search/SearchInterface';
import { GrantCard } from '@/components/grants/GrantCard';
import EmptyState from '@/components/ui/EmptyState';
import { Search as SearchIcon, GraduationCap, University, BookMarked } from 'lucide-react';
import type { GrantWithDetails } from '@/types/database';
import { DEFAULT_FILTER_STATE } from '@/constants/filters';

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
    const [grants, setGrants] = useState<GrantWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [totalResults, setTotalResults] = useState(0);

    // Trigger initial search if params are present
    useEffect(() => {
        const hasInitTerms = Object.values(initialSearchTerms).some(t => t);

        // Check if initial filters differ from defaults
        const hasInitFilters =
            initialFilters.agencies.length > 0 ||
            initialFilters.countries.length > 0 ||
            initialFilters.provinces.length > 0 ||
            initialFilters.cities.length > 0 ||
            initialFilters.valueRange.min !== DEFAULT_FILTER_STATE.valueRange.min ||
            initialFilters.valueRange.max !== DEFAULT_FILTER_STATE.valueRange.max ||
            initialFilters.dateRange.from.getTime() !== DEFAULT_FILTER_STATE.dateRange.from.getTime() ||
            initialFilters.dateRange.to.getTime() !== DEFAULT_FILTER_STATE.dateRange.to.getTime();

        if ((hasInitTerms || hasInitFilters) && !hasSearched) {
            handleSearch({ searchTerms: initialSearchTerms, filters: initialFilters }, false);
        }
    }, []);

    const updateUrl = (searchTerms: Record<string, string>, filters: typeof DEFAULT_FILTER_STATE) => {
        const params = new URLSearchParams();

        // Add search terms
        Object.entries(searchTerms).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });

        // Add array filters
        if (filters.agencies?.length) filters.agencies.forEach(v => params.append('agencies', v));
        if (filters.countries?.length) filters.countries.forEach(v => params.append('countries', v));
        if (filters.provinces?.length) filters.provinces.forEach(v => params.append('provinces', v));
        if (filters.cities?.length) filters.cities.forEach(v => params.append('cities', v));
        // Add range filters ONLY if they differ from defaults
        // Compare dates by their YYYY-MM-DD string representation to avoid timezone issues
        if (filters.dateRange?.from && filters.dateRange.from.toISOString().split('T')[0] !== DEFAULT_FILTER_STATE.dateRange.from.toISOString().split('T')[0]) {
            params.set('from', filters.dateRange.from.toISOString().split('T')[0]); // Format as YYYY-MM-DD
        }
        if (filters.dateRange?.to && filters.dateRange.to.toISOString().split('T')[0] !== DEFAULT_FILTER_STATE.dateRange.to.toISOString().split('T')[0]) {
            params.set('to', filters.dateRange.to.toISOString().split('T')[0]); // Format as YYYY-MM-DD
        }
        if (filters.valueRange?.min !== undefined && filters.valueRange.min !== DEFAULT_FILTER_STATE.valueRange.min) {
            params.set('min', filters.valueRange.min.toString());
        }
        if (filters.valueRange?.max !== undefined && filters.valueRange.max !== DEFAULT_FILTER_STATE.valueRange.max) {
            params.set('max', filters.valueRange.max.toString());
        }

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleSearch = async (params: any, shouldUpdateUrl = true) => {
        setIsLoading(true);
        setHasSearched(true);

        if (shouldUpdateUrl) {
            updateUrl(params.searchTerms, params.filters);
        }

        try {
            const response = await fetch('/api/grants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            setGrants(data.data || []);
            setTotalResults(data.pagination?.total || 0);
        } catch (error) {
            console.error('Search error:', error);
            setGrants([]);
            setTotalResults(0);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Advanced Search"
                subtitle="Search for grants across NSERC, CIHR, and SSHRC funding agencies"
            />

            <SearchInterface
                fields={[
                    {
                        key: 'recipient',
                        icon: GraduationCap,
                        placeholder: 'Search by recipient name...'
                    },
                    {
                        key: 'institute',
                        icon: University,
                        placeholder: 'Search by institute name...'
                    },
                    {
                        key: 'grant',
                        icon: BookMarked,
                        placeholder: 'Search by grant title...'
                    },
                ]}
                filterOptions={filterOptions}
                initialValues={initialSearchTerms}
                initialFilters={initialFilters}
                onSearch={handleSearch}
                showPopularSearches={true}
            />

            <div className="mt-8">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                ) : !hasSearched ? (
                    <EmptyState
                        icon={SearchIcon}
                        title="Start Your Search"
                        message="Enter search terms or use filters to find grants"
                    />
                ) : grants.length === 0 ? (
                    <EmptyState
                        icon={SearchIcon}
                        title="No Results Found"
                        message="Try adjusting your search terms or filters"
                    />
                ) : (
                    <>
                        <div className="mb-4 text-gray-600">
                            Found {totalResults.toLocaleString()} grant{totalResults !== 1 ? 's' : ''}
                            {grants.length < totalResults && ` (showing ${grants.length})`}
                        </div>
                        <div className="space-y-4">
                            {grants.map((grant) => (
                                <GrantCard key={grant.grant_id} {...grant} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </PageContainer>
    );
}
