// src/app/actions/entities.ts
'use server';

import { db } from '@/lib/db';
import { RecipientWithStats, InstituteWithStats, GrantWithDetails } from '@/types/database';
import { getCurrentUser } from '@/lib/session';

// --- Get Single Recipient ---
export async function getRecipient(id: number): Promise<RecipientWithStats | null> {
    const user = await getCurrentUser();
    const userId = user?.id;

    // Stats come from the recipient_stats materialized view (refreshed monthly
    // by the pipeline) rather than aggregating this recipient's grants live.
    const result = await db.query<RecipientWithStats>(`
    SELECT
      r.*,
      i.name as research_organization_name,
      i.city, i.province, i.country,
      s.grant_count,
      s.total_funding,
      s.avg_funding,
      s.first_grant_date,
      s.latest_grant_date,
      ${userId ? `
        EXISTS(
          SELECT 1 FROM bookmarked_recipients br
          WHERE br.recipient_id = r.recipient_id
          AND br.user_id = $1
        ) as is_bookmarked
      ` : 'false as is_bookmarked'}
    FROM recipients r
    LEFT JOIN recipient_stats s ON s.recipient_id = r.recipient_id
    LEFT JOIN institutes i ON r.institute_id = i.institute_id
    WHERE r.recipient_id = $${userId ? 2 : 1}
  `, userId ? [userId, id] : [id]);

    return result.rows[0] || null;
}

// --- Get Single Institute ---
export async function getInstitute(id: number): Promise<InstituteWithStats | null> {
    const user = await getCurrentUser();
    const userId = user?.id;

    // Stats come from the institute_stats materialized view (refreshed monthly
    // by the pipeline) rather than aggregating the whole recipient/grant tree
    // for this institute live.
    const result = await db.query<InstituteWithStats>(`
    SELECT
      i.*,
      s.recipient_count,
      s.grant_count,
      s.total_funding,
      s.avg_funding,
      s.first_grant_date,
      s.latest_grant_date,
      ${userId ? `
        EXISTS(
          SELECT 1 FROM bookmarked_institutes bi
          WHERE bi.institute_id = i.institute_id
          AND bi.user_id = $1
        ) as is_bookmarked
      ` : 'false as is_bookmarked'}
    FROM institutes i
    LEFT JOIN institute_stats s ON s.institute_id = i.institute_id
    WHERE i.institute_id = $${userId ? 2 : 1}
  `, userId ? [userId, id] : [id]);

    return result.rows[0] || null;
}

// --- Get Grants for an Entity ---
export async function getEntityGrants(
    type: 'recipient' | 'institute',
    id: number
): Promise<GrantWithDetails[]> {
    const user = await getCurrentUser();
    const userId = user?.id;

    // Determine column to filter by
    const filterCol = type === 'recipient' ? 'r.recipient_id' : 'i.institute_id';

    const params = [id];
    let bookmarkJoin = '';
    let bookmarkSelect = '';

    if (userId) {
        params.push(userId);
        bookmarkJoin = `LEFT JOIN bookmarked_grants bg ON g.grant_id = bg.grant_id AND bg.user_id = $2`;
        bookmarkSelect = ', bg.bookmarked_at, bg.notes';
    }

    const result = await db.query<GrantWithDetails>(`
    SELECT 
      g.*,
      r.legal_name, r.type,
      i.name as institute_name, i.city, i.province, i.country,
      p.prog_title_en,
      o.org_title_en
      ${bookmarkSelect}
    FROM grants g
    JOIN recipients r ON g.recipient_id = r.recipient_id
    LEFT JOIN institutes i ON r.institute_id = i.institute_id
    LEFT JOIN programs p ON g.prog_id = p.prog_id
    LEFT JOIN organizations o ON g.org = o.org
    ${bookmarkJoin}
    WHERE ${filterCol} = $1
    ORDER BY g.agreement_start_date DESC
    LIMIT 100
    `, params);

    return result.rows;
}
