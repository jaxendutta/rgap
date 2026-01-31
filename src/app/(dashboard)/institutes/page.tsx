// src/app/(dashboard)/institutes/page.tsx
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import EntitiesPage from '@/components/entity/EntitiesPage';
import { LuBuilding2 } from 'react-icons/lu';
import { InstituteWithStats } from '@/types/database';
import { Metadata } from 'next';
import { getSortOptions } from '@/lib/utils';
import { DEFAULT_ITEM_PER_PAGE } from '@/constants/data';

const sortOptions = getSortOptions('institute', 'institute');

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InstitutesPage({ searchParams }: PageProps) {
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

    // Search Filter Condition
    if (query) {
        conditions.push(`i.name ILIKE $${paramIndex}`);
        queryParams.push(`%${query}%`);
        paramIndex++;
    }

    // Bookmark Logic
    let bookmarkSelection = 'false as is_bookmarked';
    if (userId) {
        bookmarkSelection = `
            EXISTS(
                SELECT 1 FROM bookmarked_institutes bi 
                WHERE bi.institute_id = i.institute_id 
                AND bi.user_id = $${paramIndex}::integer
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
        // [FIX] Count must also respect the search filter!
        db.query(`SELECT COUNT(*) as total FROM institutes i ${whereClause}`, query ? [`%${query}%`] : []),

        db.query<InstituteWithStats>(`
            SELECT 
            i.institute_id,
            i.name,
            i.city,
            i.province,
            i.country,
            COUNT(DISTINCT r.recipient_id) as recipient_count,
            COUNT(DISTINCT g.grant_id) as grant_count,
            SUM(g.agreement_value) as total_funding,
            AVG(g.agreement_value) as avg_funding,
            MIN(g.agreement_start_date::date) as first_grant_date,
            MAX(g.agreement_start_date::date) as latest_grant_date,
            ${bookmarkSelection}
            FROM institutes i
            LEFT JOIN recipients r ON i.institute_id = r.institute_id
            LEFT JOIN grants g ON r.recipient_id = g.recipient_id
            ${whereClause} -- [FIX] Applied filter here
            GROUP BY i.institute_id
            ORDER BY ${sortField} ${sortDir} NULLS LAST
            LIMIT $${limitIndex} OFFSET $${offsetIndex}
        `, queryParams)
    ]);

    const totalItems = parseInt(countResult.rows[0].total);
    const institutes = result.rows;

    return (
        <EntitiesPage
            title="Institutes"
            subtitle="Explore research institutes and their funding distribution"
            icon={LuBuilding2}
            entities={institutes}
            totalItems={totalItems}
            entityType="institute"
            emptyMessage={query ? `No institutes found matching "${query}"` : "No institutes found"}
            showVisualization={true}
            page={page}
        />
    );
}

export const metadata: Metadata = {
    title: 'Institutes | RGAP',
    description: 'Browse research institutes and funding organizations',
};
