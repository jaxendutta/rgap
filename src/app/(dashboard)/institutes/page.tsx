// src/app/(dashboard)/institutes/page.tsx
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import EntitiesPage from '@/components/entity/EntitiesPage';
import { LuUniversity } from 'react-icons/lu';
import { InstituteWithStats, GrantWithDetails } from '@/types/database';
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

    // 1. Pagination & Sort Params
    const page = Math.max(1, Number(resolvedParams.page) || 1);
    const offset = (page - 1) * DEFAULT_ITEM_PER_PAGE;

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
    queryParams.push(DEFAULT_ITEM_PER_PAGE);
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

    // 4. NEW: Fetch Grants for Visualization (for the displayed institutes)
    let visualizationData: GrantWithDetails[] = [];
    if (institutes.length > 0) {
        const instituteIds = institutes.map(i => i.institute_id);
        const grantsResult = await db.query<GrantWithDetails>(`
            SELECT 
                g.*, 
                r.legal_name,
                i.name, i.city, i.province, i.country,
                org.org_title_en,
                p.prog_title_en
            FROM grants g
            JOIN recipients r ON g.recipient_id = r.recipient_id
            JOIN institutes i ON r.institute_id = i.institute_id
            LEFT JOIN organizations org ON g.org = org.org
            LEFT JOIN programs p ON g.prog_id = p.prog_id
            WHERE i.institute_id = ANY($1)
            ORDER BY g.agreement_start_date DESC
        `, [instituteIds]);
        visualizationData = grantsResult.rows;
    }

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
            visualizationData={visualizationData}
        />
    );
}

export const metadata: Metadata = {
    title: 'Institutes | RGAP',
    description: 'Browse research institutions',
};
