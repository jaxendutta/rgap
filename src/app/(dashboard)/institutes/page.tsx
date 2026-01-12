// src/app/(dashboard)/institutes/page.tsx
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import EntitiesPage from '@/components/entity/EntitiesPage';
import { SortOption } from '@/components/entity/EntityList';
import { University } from 'lucide-react';
import { InstituteWithStats } from '@/types/database';
import { Metadata } from 'next';

const SORT_FIELDS = {
    funding: 'total_funding',
    count: 'grant_count',
    name: 'name'
};

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InstitutesPage({ searchParams }: PageProps) {
    const user = await getCurrentUser();
    const userId = user?.id;
    const resolvedParams = await searchParams;

    // 1. Pagination & Sort Params
    const page = Number(resolvedParams.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const sortParam = (resolvedParams.sort as string) || 'funding';
    const sortDir = (resolvedParams.dir as string) === 'asc' ? 'ASC' : 'DESC';
    const sortField = SORT_FIELDS[sortParam as keyof typeof SORT_FIELDS] || 'total_funding';

    // 2. Counts
    const countResult = await db.query(`SELECT COUNT(*) as total FROM institutes`);
    const totalItems = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalItems / limit);

    // 3. Data Query
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
      ${userId ? `
        EXISTS(
          SELECT 1 FROM bookmarked_institutes bi 
          WHERE bi.institute_id = i.institute_id 
          AND bi.user_id = $1
        ) as is_bookmarked
      ` : 'false as is_bookmarked'}
    FROM institutes i
    LEFT JOIN recipients r ON i.institute_id = r.institute_id
    LEFT JOIN grants g ON r.recipient_id = g.recipient_id
    GROUP BY i.institute_id
    ORDER BY ${sortField} ${sortDir} NULLS LAST
    LIMIT $${userId ? 2 : 1} OFFSET $${userId ? 3 : 2}
  `, userId ? [userId, limit, offset] : [limit, offset]);

    const institutes = result.rows;

    // 4. Sort Config
    const sortOptions: SortOption[] = [
        { label: 'Total Funding', field: 'funding', icon: 'funding' },
        { label: 'Grant Count', field: 'count', icon: 'count' },
        { label: 'Name', field: 'name', icon: 'text' },
    ];

    return (
        <EntitiesPage
            title="Institutes"
            subtitle="Browse research institutions and their funding statistics"
            icon={University}
            entities={institutes}
            totalItems={totalItems}
            totalPages={totalPages}
            sortOptions={sortOptions}
            entityType="institute"
            emptyMessage="No institutes found"
        />
    );
}

export const metadata: Metadata = {
    title: 'Institutes | RGAP',
    description: 'Browse research institutions',
};
