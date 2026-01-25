// src/app/(dashboard)/recipients/page.tsx
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import EntitiesPage from '@/components/entity/EntitiesPage';
import { LuUsers } from 'react-icons/lu';
import { RecipientWithStats, GrantWithDetails } from '@/types/database';
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

    // 1. Pagination & Sort
    const page = Math.max(1, Number(resolvedParams.page) || 1);
    const offset = (page - 1) * DEFAULT_ITEM_PER_PAGE;

    const sortParam = (resolvedParams.sort as string) || sortOptions[0].value;
    const sortDir = (resolvedParams.dir as string) === 'asc' ? 'ASC' : 'DESC';
    const sortField = sortOptions.find(option => option.value === sortParam)?.field || sortOptions[0].field;

    // 2. Count
    const countResult = await db.query(`SELECT COUNT(*) as total FROM recipients`);
    const totalItems = parseInt(countResult.rows[0].total);

    // 3. Build Dynamic Query
    const queryParams: any[] = [];
    let paramIndex = 1;

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

    queryParams.push(DEFAULT_ITEM_PER_PAGE);
    const limitIndex = paramIndex++;

    queryParams.push(offset);
    const offsetIndex = paramIndex++;

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
      ${bookmarkSelection}
    FROM recipients r
    LEFT JOIN institutes i ON r.institute_id = i.institute_id
    LEFT JOIN grants g ON r.recipient_id = g.recipient_id
    GROUP BY r.recipient_id, i.name, i.city, i.province, i.country
    ORDER BY ${sortField} ${sortDir} NULLS LAST
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
  `, queryParams);

    const recipients = result.rows;

    // 4. NEW: Fetch Grants for Visualization (for the displayed recipients)
    let visualizationData: GrantWithDetails[] = [];
    if (recipients.length > 0) {
        const recipientIds = recipients.map(r => r.recipient_id);
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
            WHERE r.recipient_id = ANY($1)
            ORDER BY g.agreement_start_date DESC
        `, [recipientIds]);
        visualizationData = grantsResult.rows;
    }

    return (
        <EntitiesPage
            title="Recipients"
            subtitle="Browse grant recipients and their research funding"
            icon={LuUsers}
            entities={recipients}
            totalItems={totalItems}
            entityType="recipient"
            emptyMessage="No recipients found"
            showVisualization={true}
            visualizationData={visualizationData}
        />
    );
}

export const metadata: Metadata = {
    title: 'Recipients | RGAP',
    description: 'Browse research grant recipients',
};
