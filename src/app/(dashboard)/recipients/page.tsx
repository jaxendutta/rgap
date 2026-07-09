// src/app/(dashboard)/recipients/page.tsx
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import EntitiesPage from '@/components/entity/EntitiesPage';
import { LuUsers } from 'react-icons/lu';
import { RecipientWithStats } from '@/types/database';
import { Metadata } from 'next';
import { getSortOptions } from '@/lib/utils';
import { DEFAULT_ITEM_PER_PAGE } from '@/constants/data';

const sortOptions = getSortOptions('recipient', 'recipient');

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RecipientsPage({ searchParams }: PageProps) {
    const user = await getCurrentUser();
    const userId = user?.id;
    const resolvedParams = await searchParams;

    // 1. Extract Parameters
    const page = Math.max(1, Number(resolvedParams.page) || 1);
    const query = (resolvedParams.query as string) || ''; // [FIX] Extract Search Query
    const offset = (page - 1) * DEFAULT_ITEM_PER_PAGE;

    const sortParam = (resolvedParams.sort as string) || sortOptions[0].value;
    const sortDir = (resolvedParams.dir as string) === 'asc' ? 'ASC' : 'DESC';
    const sortField = sortOptions.find(option => option.value === sortParam)?.field || sortOptions[0].field;

    // 2. Build Dynamic SQL
    const queryParams: any[] = [];
    let paramIndex = 1;
    const conditions: string[] = [];

    // [FIX] Add Search Filter Condition
    if (query) {
        conditions.push(`r.legal_name ILIKE $${paramIndex}`);
        queryParams.push(`%${query}%`);
        paramIndex++;
    }

    // Bookmark Logic
    let bookmarkSelection = 'false as is_bookmarked';
    if (userId) {
        bookmarkSelection = `
            EXISTS(
                SELECT 1 FROM bookmarked_recipients br 
                WHERE br.recipient_id = r.recipient_id 
                AND br.user_id = $${paramIndex}::integer
            ) as is_bookmarked
        `;
        queryParams.push(userId);
        paramIndex++;
    }

    // Combine WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Add Pagination Params
    queryParams.push(DEFAULT_ITEM_PER_PAGE);
    const limitIndex = paramIndex++;

    queryParams.push(offset);
    const offsetIndex = paramIndex++;

    // 3. Execute Queries
    const [countResult, result] = await Promise.all([
        // Count must also respect the search filter!
        db.query(`SELECT COUNT(*) as total FROM recipients r ${whereClause}`, query ? [`%${query}%`] : []),

        // Stats come from the recipient_stats materialized view (refreshed by
        // the monthly pipeline) instead of aggregating the whole grants table
        // on every request. INNER JOIN is safe: recipient_stats has exactly
        // one row per recipient, so every recipient still appears.
        db.query<RecipientWithStats>(`
            SELECT
            r.recipient_id,
            r.legal_name,
            r.type,
            r.institute_id,
            i.name as research_organization_name,
            i.city,
            i.province,
            i.country,
            s.grant_count,
            s.total_funding,
            s.avg_funding,
            s.first_grant_date,
            s.latest_grant_date,
            ${bookmarkSelection}
            FROM recipients r
            JOIN recipient_stats s ON s.recipient_id = r.recipient_id
            LEFT JOIN institutes i ON r.institute_id = i.institute_id
            ${whereClause}
            ORDER BY ${sortField} ${sortDir} NULLS LAST
            LIMIT $${limitIndex} OFFSET $${offsetIndex}
        `, queryParams)
    ]);

    const totalItems = parseInt(countResult.rows[0].total);
    const recipients = result.rows;

    return (
        <EntitiesPage
            title="Recipients"
            subtitle="Browse grant recipients and their research funding"
            icon={LuUsers}
            entities={recipients}
            totalItems={totalItems}
            entityType="recipient"
            emptyMessage={query ? `No recipients found matching "${query}"` : "No recipients found"}
            showVisualization={true}
            page={page}
        />
    );
}

export const metadata: Metadata = {
    title: 'Recipients | RGAP',
    description: 'Browse research grant recipients',
};
