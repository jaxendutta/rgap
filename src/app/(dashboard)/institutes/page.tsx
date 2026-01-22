// src/app/(dashboard)/institutes/page.tsx
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import EntitiesPage from '@/components/entity/EntitiesPage';
import { LuUniversity } from 'react-icons/lu';
import { InstituteWithStats } from '@/types/database';
import { Metadata } from 'next';
import { getSortOptions } from '@/lib/utils';

const sortOptions = getSortOptions('institute', 'institute');

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InstitutesPage({ searchParams }: PageProps) {
    const user = await getCurrentUser();
    const userId = user?.id;
    const resolvedParams = await searchParams;

    // 1. Pagination & Sort Params
    const page = Math.max(1, Number(resolvedParams.page) || 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    const sortParam = (resolvedParams.sort as string) || sortOptions[0].value;
    const sortDir = (resolvedParams.dir as string) === 'asc' ? 'ASC' : 'DESC';
    const sortField = sortOptions.find(option => option.value === sortParam)?.field || sortOptions[0].field;

    // 2. Counts
    const countResult = await db.query(`SELECT COUNT(*) as total FROM institutes`);
    const totalItems = parseInt(countResult.rows[0].total);

    // 3. Build Dynamic Query
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Handle Bookmark Join Logic
    let bookmarkSelection = 'false as is_bookmarked';

    if (userId) {
        // FIXED: Added ::integer cast to $1 to prevent "could not determine data type" error
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

    // Add Limit/Offset params
    queryParams.push(limit);
    const limitIndex = paramIndex++;

    queryParams.push(offset);
    const offsetIndex = paramIndex++;

    const result = await db.query<InstituteWithStats>(`
    SELECT 
      i.institute_id,
      i.name,
      i.city,
      i.province,
      i.country,
      i.postal_code,
      COUNT(DISTINCT r.recipient_id) as recipient_count,
      COUNT(DISTINCT g.grant_id) as grant_count,
      SUM(g.agreement_value) as total_funding,
      ${bookmarkSelection}
    FROM institutes i
    LEFT JOIN recipients r ON i.institute_id = r.institute_id
    LEFT JOIN grants g ON r.recipient_id = g.recipient_id
    GROUP BY i.institute_id
    ORDER BY ${sortField} ${sortDir} NULLS LAST
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
  `, queryParams);

    const institutes = result.rows;

    return (
        <EntitiesPage
            title="Institutes"
            subtitle="Browse research institutions and their funding statistics"
            icon={LuUniversity}
            entities={institutes}
            totalItems={totalItems}
            entityType="institute"
            emptyMessage="No institutes found"
            showVisualization={true}
        />
    );
}

export const metadata: Metadata = {
    title: 'Institutes | RGAP',
    description: 'Browse research institutions',
};
