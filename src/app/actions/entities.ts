'use server';

import { db } from '@/lib/db';
import { RecipientWithStats, InstituteWithStats, GrantWithDetails } from '@/types/database';
import { getCurrentUser } from '@/lib/session';

// --- Get Single Recipient ---
export async function getRecipient(id: number): Promise<RecipientWithStats | null> {
    const user = await getCurrentUser();
    const userId = user?.id;

    const result = await db.query<RecipientWithStats>(`
    SELECT 
      r.*,
      i.name as research_organization_name,
      i.city, i.province, i.country,
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
    WHERE r.recipient_id = $${userId ? 2 : 1}
    GROUP BY r.recipient_id, i.name, i.city, i.province, i.country
  `, userId ? [userId, id] : [id]);

    return result.rows[0] || null;
}

// --- Get Single Institute ---
export async function getInstitute(id: number): Promise<InstituteWithStats | null> {
    const user = await getCurrentUser();
    const userId = user?.id;

    const result = await db.query<InstituteWithStats>(`
    SELECT 
      i.*,
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
    WHERE i.institute_id = $${userId ? 2 : 1}
    GROUP BY i.institute_id
  `, userId ? [userId, id] : [id]);

    return result.rows[0] || null;
}

// --- Get Grants for an Entity ---
export async function getEntityGrants(
    type: 'recipient' | 'institute',
    id: number
): Promise<GrantWithDetails[]> {
    // Determine column to filter by
    const filterCol = type === 'recipient' ? 'r.recipient_id' : 'i.institute_id';

    // Note: This query joins everything to get full grant details
    const result = await db.query<GrantWithDetails>(`
    SELECT 
      g.*,
      r.legal_name, r.type,
      i.name as institute_name, i.city, i.province, i.country,
      p.prog_title_en,
      o.org_title_en
    FROM grants g
    JOIN recipients r ON g.recipient_id = r.recipient_id
    JOIN institutes i ON r.institute_id = i.institute_id
    LEFT JOIN programs p ON g.prog_id = p.prog_id
    LEFT JOIN organizations o ON g.org = o.org
    WHERE ${filterCol} = $1
    ORDER BY g.agreement_start_date DESC
    LIMIT 100
  `, [id]);

    return result.rows;
}
