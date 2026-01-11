// src/app/(dashboard)/recipients/page.tsx
// No function passing to Client Components!

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import PageHeader from '@/components/layout/PageHeader';
import EntityList from '@/components/ui/EntityList';
import { EntityCard } from '@/components/ui/EntityCard';
import { Users } from 'lucide-react';
import { RecipientWithStats } from '@/types/database';
import PageContainer from '@/components/layout/PageContainer';

export default async function RecipientsPage() {
    const user = await getCurrentUser();
    const userId = user?.id;

    // Fetch recipients with stats
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
      MAX(g.agreement_start_date) as latest_grant_date,
      MIN(g.agreement_start_date) as first_grant_date,
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
    ORDER BY total_funding DESC NULLS LAST
    LIMIT 100
  `, userId ? [userId] : []);

    const recipients = result.rows;

    return (
        <PageContainer className="space-y-6">
            <PageHeader
                title="Recipients"
                subtitle="Browse grant recipients and their research funding"
                icon={Users}
            />

            <EntityList
                entities={recipients}
                entityType="recipient"
                emptyMessage="No recipients found"
            >
                {/* Render items HERE (in Server Component) instead of passing function */}
                {recipients.map((recipient) => (
                    <EntityCard
                        key={recipient.recipient_id}
                        entity={recipient}
                        entityType="recipient"
                    />
                ))}
            </EntityList>
        </PageContainer>
    );
}

export const metadata = {
    title: 'Recipients | RGAP',
    description: 'Browse research grant recipients',
};
