// src/app/(dashboard)/recipients/[id]/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { RecipientDetailClient } from './client';
import { RecipientWithStats, GrantWithDetails } from '@/types/database';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getRecipientDetails(id: number, userId?: number) {
    const query = `
        SELECT 
            r.recipient_id,
            r.legal_name,
            r.type,
            r.business_number,
            r.operating_name,
            r.institute_id,
            i.name as research_organization_name,
            i.city,
            i.province,
            i.country,
            COUNT(DISTINCT g.grant_id)::int as grant_count,
            COALESCE(SUM(g.agreement_value::numeric), 0) as total_funding,
            COALESCE(AVG(g.agreement_value::numeric), 0) as avg_funding,
            COALESCE(AVG(g.agreement_end_date - g.agreement_start_date), 0)::int as avg_duration_days,
            MIN(g.agreement_start_date) as first_grant_date,
            MAX(g.agreement_start_date) as latest_grant_date,
            COUNT(DISTINCT g.org)::int as funding_agencies_count,
            ${userId ? `
                EXISTS(
                    SELECT 1 FROM bookmarked_recipients br 
                    WHERE br.recipient_id = r.recipient_id 
                    AND br.user_id = $2::int
                ) as is_bookmarked
            ` : 'false as is_bookmarked'}
        FROM recipients r
        LEFT JOIN institutes i ON r.institute_id = i.institute_id
        LEFT JOIN grants g ON r.recipient_id = g.recipient_id
        WHERE r.recipient_id = $1
        GROUP BY r.recipient_id, i.name, i.city, i.province, i.country
    `;

    const params = userId ? [id, userId] : [id];
    const result = await db.query<RecipientWithStats>(query, params);

    return result.rows[0] || null;
}

const ALLOWED_SORT_FIELDS = ['agreement_value', 'agreement_start_date', 'recipient'];

async function getRecipientGrants(
    id: number,
    userId: number | undefined,
    page: number,
    pageSize: number,
    sortField: string = 'agreement_start_date',
    sortDir: 'asc' | 'desc' = 'desc'
) {
    const offset = (page - 1) * pageSize;

    const safeSortField = ALLOWED_SORT_FIELDS.includes(sortField) ? sortField : 'agreement_start_date';
    const orderBy = safeSortField === 'agreement_value' ? 'g.agreement_value' : 'g.agreement_start_date';
    const safeSortDir = sortDir === 'asc' ? 'ASC' : 'DESC';

    const query = `
        SELECT 
            g.*,
            r.type, r.business_number, r.legal_name, r.operating_name,
            i.institute_id, i.name, i.city, i.province, i.country, i.postal_code,
            p.prog_title_en, p.prog_purpose_en,
            o.org_fr, o.org_title_en, o.org_title_fr,
            ${userId ? `
                EXISTS(
                    SELECT 1 FROM bookmarked_grants bg 
                    WHERE bg.grant_id = g.grant_id 
                    AND bg.user_id = $4::int
                ) as is_bookmarked
            ` : 'false as is_bookmarked'}
        FROM grants g
        JOIN recipients r ON g.recipient_id = r.recipient_id
        JOIN institutes i ON r.institute_id = i.institute_id
        LEFT JOIN programs p ON g.prog_id = p.prog_id
        JOIN organizations o ON g.org = o.org
        WHERE g.recipient_id = $1
        ORDER BY ${orderBy} ${safeSortDir} NULLS LAST
        LIMIT $2 OFFSET $3
    `;

    const params = userId
        ? [id, pageSize, offset, userId]
        : [id, pageSize, offset];

    const result = await db.query<GrantWithDetails>(query, params);
    return result.rows;
}

async function getAnalyticsGrants(id: number) {
    // FIXED: Added g.agreement_end_date here!
    const query = `
        SELECT 
            g.grant_id,
            g.agreement_value,
            g.agreement_start_date,
            g.agreement_end_date,
            g.recipient_id,
            p.prog_title_en,
            o.org_title_en,
            o.org
        FROM grants g
        LEFT JOIN programs p ON g.prog_id = p.prog_id
        JOIN organizations o ON g.org = o.org
        WHERE g.recipient_id = $1
        ORDER BY g.agreement_start_date ASC
    `;
    const result = await db.query<GrantWithDetails>(query, [id]);
    return result.rows;
}

async function getTopPrograms(id: number) {
    const result = await db.query(`
        SELECT 
            p.prog_id,
            p.prog_title_en as program_name,
            COUNT(g.grant_id)::int as grant_count,
            COALESCE(SUM(g.agreement_value), 0) as total_funding
        FROM grants g
        LEFT JOIN programs p ON g.prog_id = p.prog_id
        WHERE g.recipient_id = $1 AND p.prog_title_en IS NOT NULL
        GROUP BY p.prog_id, p.prog_title_en
        ORDER BY total_funding DESC NULLS LAST
        LIMIT 5
    `, [id]);
    return result.rows;
}

export default async function RecipientPage({ params, searchParams }: PageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const id = parseInt(resolvedParams.id);
    const page = parseInt((resolvedSearchParams.page as string) || '1');
    const tab = (resolvedSearchParams.tab as string) || 'grants';
    const sort = (resolvedSearchParams.sort as string) || 'agreement_start_date';
    const dir = (resolvedSearchParams.dir as 'asc' | 'desc') || 'desc';
    const limit = 15;

    if (isNaN(id)) notFound();

    const user = await getCurrentUser();
    const recipient = await getRecipientDetails(id, user?.id);

    if (!recipient) notFound();

    let grants: GrantWithDetails[] = [];
    let topPrograms: any[] = [];

    if (tab === 'analytics') {
        grants = await getAnalyticsGrants(id);
        topPrograms = await getTopPrograms(id);
    } else {
        grants = await getRecipientGrants(id, user?.id, page, limit, sort, dir);
    }

    return (
        <RecipientDetailClient
            recipient={recipient}
            grants={grants}
            topPrograms={topPrograms}
            userId={user?.id}
            page={page}
            pageSize={limit}
            activeTab={tab}
        />
    );
}

export async function generateMetadata({ params }: PageProps) {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) return { title: 'Recipient Not Found | RGAP' };

    const result = await db.query('SELECT legal_name FROM recipients WHERE recipient_id = $1', [id]);
    if (result.rows.length === 0) return { title: 'Recipient Not Found | RGAP' };

    return {
        title: `${result.rows[0].legal_name} | RGAP`,
        description: `View detailed information about ${result.rows[0].legal_name}.`
    };
}
