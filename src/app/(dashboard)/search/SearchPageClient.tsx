// src/app/(dashboard)/search/SearchPageClient.tsx
// Client Component - Handles interactive search UI

'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import SearchInterface from '@/components/search/SearchInterface';
import { GrantCard } from '@/components/grants/GrantCard';
import EmptyState from '@/components/ui/EmptyState';
import { Search as SearchIcon, GraduationCap, University, BookMarked } from 'lucide-react';
import type { GrantWithDetails } from '@/types/database';

interface FilterOptions {
    agencies: string[];
    countries: string[];
    provinces: string[];
    cities: string[];
}

interface SearchPageClientProps {
    filterOptions: FilterOptions;
}

export default function SearchPageClient({ filterOptions }: SearchPageClientProps) {
    const [grants, setGrants] = useState<GrantWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [totalResults, setTotalResults] = useState(0);

    const handleSearch = async (params: any) => {
        setIsLoading(true);
        setHasSearched(true);

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
