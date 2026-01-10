// src/app/(dashboard)/institutes/page.tsx
// No function passing to Client Components!

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import PageHeader from '@/components/layout/PageHeader';
import EntityList from '@/components/ui/EntityList';
import { EntityCard } from '@/components/ui/EntityCard';
import { University } from 'lucide-react';
import { InstituteWithStats } from '@/types/database';
import PageContainer from '@/components/layout/PageContainer';

export default async function InstitutesPage() {
    const user = await getCurrentUser();
    const userId = user?.id;

    // Fetch institutes with stats
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
      MAX(g.agreement_start_date) as latest_grant_date,
      MIN(g.agreement_start_date) as first_grant_date,
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
    ORDER BY total_funding DESC NULLS LAST
    LIMIT 50
  `, userId ? [userId] : []);

    const institutes = result.rows;

    return (
        <PageContainer className="space-y-6">
            <PageHeader
                title="Institutes"
                subtitle="Browse research institutions and their funding statistics"
                icon={University}
            />

            <EntityList
                entities={institutes}
                entityType="institute"
                emptyMessage="No institutes found"
            >
                {institutes.map((institute) => (
                    <EntityCard
                        key={institute.institute_id}
                        entity={institute}
                        entityType="institute"
                    />
                ))}
            </EntityList>
        </PageContainer>
    );
}

export const metadata = {
    title: 'Institutes | RGAP',
    description: 'Browse research institutions',
};
