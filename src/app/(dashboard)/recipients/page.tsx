// src/app/(dashboard)/recipients/page.tsx
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import EntitiesPage from '@/components/entity/EntitiesPage';
import { SortOption } from '@/components/entity/EntityList';
import { Users } from 'lucide-react';
import { RecipientWithStats } from '@/types/database';
import { Metadata } from 'next';

const SORT_FIELDS = {
    funding: 'total_funding',
    count: 'grant_count',
    name: 'legal_name'
};

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RecipientsPage({ searchParams }: PageProps) {
    const user = await getCurrentUser();
    const userId = user?.id;
    const resolvedParams = await searchParams;

    // 1. Pagination & Sort
    const page = Number(resolvedParams.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const sortParam = (resolvedParams.sort as string) || 'funding';
    const sortDir = (resolvedParams.dir as string) === 'asc' ? 'ASC' : 'DESC';
    const sortField = SORT_FIELDS[sortParam as keyof typeof SORT_FIELDS] || 'total_funding';

    // 2. Count
    const countResult = await db.query(`SELECT COUNT(*) as total FROM recipients`);
    const totalItems = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalItems / limit);

    // 3. Data Query
    const result = await db.query<RecipientWithStats>(`
    SELECT 
      r.recipient_id,
      r.legal_name,
      r.type,
      r.institute_id,
      i.name as research_organization_name,
      i.city,
      i.province,
      i.country,
      COUNT(DISTINCT g.grant_id) as grant_count,
      SUM(g.agreement_value) as total_funding,
      AVG(g.agreement_value) as avg_funding,
      MIN(g.agreement_start_date::date) as first_grant_date,
      MAX(g.agreement_start_date::date) as latest_grant_date,
      ${userId ? `
        EXISTS(
          SELECT 1 FROM bookmarked_recipients br 
          WHERE br.recipient_id = r.recipient_id 
          AND br.user_id = $1
        ) as is_bookmarked
      ` : 'false as is_bookmarked'}
    FROM recipients r
    LEFT JOIN institutes i ON r.institute_id = i.institute_id
    LEFT JOIN grants g ON r.recipient_id = g.recipient_id
    GROUP BY r.recipient_id, i.name, i.city, i.province, i.country
    ORDER BY ${sortField} ${sortDir} NULLS LAST
    LIMIT $${userId ? 2 : 1} OFFSET $${userId ? 3 : 2}
  `, userId ? [userId, limit, offset] : [limit, offset]);

    const recipients = result.rows;

    // 4. Sort Options
    const sortOptions: SortOption[] = [
        { label: 'Total Funding', field: 'funding', icon: 'funding' },
        { label: 'Grant Count', field: 'count', icon: 'count' },
        { label: 'Name', field: 'name', icon: 'text' },
    ];

    return (
        <EntitiesPage
            title="Recipients"
            subtitle="Browse grant recipients and their research funding"
            icon={Users}
            entities={recipients}
            totalItems={totalItems}
            totalPages={totalPages}
            sortOptions={sortOptions}
            entityType="recipient"
            emptyMessage="No recipients found"
        />
    );
}

export const metadata: Metadata = {
    title: 'Recipients | RGAP',
    description: 'Browse research grant recipients',
};
