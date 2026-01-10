// src/app/(dashboard)/search/page.tsx
// Server Component - Direct DB access

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import PageHeader from '@/components/layout/PageHeader';
import SearchInterface from '@/components/features/search/SearchInterface';
import { GrantCard } from '@/components/features/grants/GrantCard';
import EmptyState from '@/components/ui/EmptyState';
import { Search as SearchIcon, FileSearch2 } from 'lucide-react';
import { ResearchGrant } from '@/types/database';
import PageContainer from '@/components/layout/PageContainer';

interface SearchPageProps {
    searchParams: {
        recipient?: string;
        institute?: string;
        grant?: string;
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const user = await getCurrentUser();
    const userId = user?.id;

    const { recipient, institute, grant } = searchParams;

    // Check if we have any search terms
    const hasSearchTerms = !!(recipient || institute || grant);

    let grants: ResearchGrant[] = [];

    if (hasSearchTerms) {
        // Build dynamic SQL query
        const conditions: string[] = [];
        const params: any[] = [];
        let paramCount = 1;

        if (recipient) {
            conditions.push(`r.legal_name ILIKE $${paramCount}`);
            params.push(`%${recipient}%`);
            paramCount++;
        }

        if (institute) {
            conditions.push(`i.name ILIKE $${paramCount}`);
            params.push(`%${institute}%`);
            paramCount++;
        }

        if (grant) {
            conditions.push(`g.agreement_title_en ILIKE $${paramCount}`);
            params.push(`%${grant}%`);
            paramCount++;
        }

        // Add user ID for bookmarks if logged in
        if (userId) {
            params.push(userId);
        }

        const whereClause = conditions.length > 0
            ? `WHERE ${conditions.join(' AND ')}`
            : '';

        // Execute query
        const result = await db.query(`
      SELECT 
        g.*,
        r.legal_name as recipient_name,
        r.type as recipient_type,
        i.name as institute_name,
        i.city,
        i.province,
        i.country,
        p.prog_title_en as program_name,
        o.org_name_en as organization_name,
        ${userId ? `
          EXISTS(
            SELECT 1 FROM bookmarked_grants bg 
            WHERE bg.grant_id = g.grant_id 
            AND bg.user_id = $${paramCount}
          ) as is_bookmarked
        ` : 'false as is_bookmarked'}
      FROM grants g
      JOIN recipients r ON g.recipient_id = r.recipient_id
      JOIN institutes i ON r.institute_id = i.institute_id
      LEFT JOIN programs p ON g.prog_id = p.prog_id
      LEFT JOIN organizations o ON g.org_id = o.org_id
      ${whereClause}
      ORDER BY g.agreement_start_date DESC
      LIMIT 100
    `, params);

        grants = result.rows;
    }

    return (
        <PageContainer className="space-y-6">
            <PageHeader
                title="Search Grants"
                subtitle="Search across recipients, institutes, and grant details"
                icon={SearchIcon}
            />

            {/* Search form */}
            <SearchInterface
                initialValues={{
                    recipient: recipient || '',
                    institute: institute || '',
                    grant: grant || '',
                }}
            />

            {/* Results */}
            <div className="space-y-4">
                {!hasSearchTerms ? (
                    <EmptyState
                        icon={FileSearch2}
                        title="Start Your Search"
                        message="Enter search terms above to find grants across all funding agencies"
                    />
                ) : grants.length === 0 ? (
                    <EmptyState
                        icon={FileSearch2}
                        title="No Results Found"
                        message="Try adjusting your search terms"
                    />
                ) : (
                    <>
                        <div className="text-sm text-gray-600">
                            Found {grants.length} grants
                            {grants.length === 100 && ' (showing first 100 results)'}
                        </div>

                        <div className="space-y-4">
                            {grants.map((grant) => (
                                <GrantCard key={grant.grant_id} grant={grant} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </PageContainer>
    );
}

export const metadata = {
    title: 'Search | RGAP',
    description: 'Search research grants',
};
